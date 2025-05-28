import React, { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  TextField,
  Grid,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Slider,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CropIcon from "@mui/icons-material/Crop";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import EditIcon from "@mui/icons-material/Edit";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";

// Import the separate TiptapEditor component
import TiptapEditor from "./TiptapEditor";
import CourseHeader from "./CourseHeader";
import BottomToolbar from "./BottomToolbar";

// Import the image uploader utility
import { getRandomSampleImage } from "../utils/imageUploader";

// Sample images
const sampleImages = [
  "https://picsum.photos/800/400?random=1",
  "https://picsum.photos/800/400?random=2",
  "https://picsum.photos/800/400?random=3",
  "https://picsum.photos/800/400?random=4",
  "https://picsum.photos/800/400?random=5",
  "https://picsum.photos/800/400?random=6",
  "https://picsum.photos/800/400?random=7",
  "https://picsum.photos/800/400?random=8",
];

export const SinglePageLayout = () => {
  const { id } = useParams();
  const location = useLocation();

  const courseData = location.state?.courseData || { title: "Untitled course" };
  const [title] = useState(courseData.title);
  const [dividerColor] = useState("#f5756c");

  // Update the state to include different block types
  const [contentBlocks, setContentBlocks] = useState([
    {
      type: "text",
      id: Date.now(),
      content:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      isEditing: false,
    },
  ]);

  // Track which block is currently being edited
  const [editingBlockId, setEditingBlockId] = useState(null);

  // Create ref for the editor container
  const editorRefs = useRef({});

  // Add state for image dialog
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [imageAltText, setImageAltText] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const fileInputRef = useRef(null);

  // Add state for image editing features
  const [imageEditDialogOpen, setImageEditDialogOpen] = useState(false);
  const [currentEditingImage, setCurrentEditingImage] = useState(null);
  const [imageAlignment, setImageAlignment] = useState("center");
  const [imageWidth, setImageWidth] = useState(100);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageMenuAnchorEl, setImageMenuAnchorEl] = useState(null);

  // Add a useEffect to track contentBlocks changes
  useEffect(() => {
    if (contentBlocks.length > 0) {
      console.log("Content blocks updated:", contentBlocks.length);
    }
  }, [contentBlocks]);

  // Effect to handle clicks outside the editor
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!editingBlockId) return; // No active editor, nothing to do

      // Get the current editor reference
      const editorRef = editorRefs.current[editingBlockId];
      if (!editorRef) return; // No reference found

      // Check if click is inside the editor
      if (editorRef.contains(event.target)) {
        return; // Click is inside editor, do nothing
      }

      // Check if the click is on any of these elements which should not close the editor
      const shouldNotClose =
        event.target.closest(".tiptap-editor-wrapper") ||
        event.target.closest(".tiptap-toolbar") ||
        event.target.closest(".ProseMirror") ||
        event.target.closest(".MuiMenu-paper") ||
        event.target.closest(".MuiPopover-paper") ||
        event.target.closest(".MuiDialog-container") ||
        event.target.closest("button") ||
        event.target.closest(".emoji-mart") ||
        event.target.closest(".emoji-picker") ||
        event.target.closest(".MuiTooltip-popper") ||
        event.target.closest(".block-controls") ||
        event.target.closest(".BottomToolbar") ||
        event.target.closest(".color-picker");

      // Only close if not clicking on any of the above elements
      if (!shouldNotClose) {
        closeEditor();
      }
    };

    // Only add the listener when an editor is active
    if (editingBlockId) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingBlockId]);

  // Function to add a new text editor
  const addTextEditor = () => {
    // Close any currently open editor
    const updatedBlocks = contentBlocks.map((block) => ({
      ...block,
      isEditing: false,
    }));

    // Add new block and set it to editing mode
    const newBlock = {
      type: "text",
      id: Date.now(),
      content: "Click to edit this text...",
      isEditing: true,
    };

    setContentBlocks([...updatedBlocks, newBlock]);
    setEditingBlockId(newBlock.id);
  };

  // Function to delete a text editor
  const deleteBlock = (idToDelete) => {
    // Don't delete if it's the last block
    // if (contentBlocks.length <= 1) return;

    setContentBlocks(contentBlocks.filter((block) => block.id !== idToDelete));
    if (editingBlockId === idToDelete) {
      setEditingBlockId(null);
    }
  };

  // Function to move a block up
  const moveBlockUp = (index) => {
    if (index === 0) return; // Already at the top

    const newBlocks = [...contentBlocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index - 1];
    newBlocks[index - 1] = temp;

    setContentBlocks(newBlocks);
  };

  // Function to move a block down
  const moveBlockDown = (index) => {
    if (index === contentBlocks.length - 1) return; // Already at the bottom

    const newBlocks = [...contentBlocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index + 1];
    newBlocks[index + 1] = temp;

    setContentBlocks(newBlocks);
  };

  // Toggle edit mode for a block
  const toggleEditMode = (blockId) => {
    // If clicking the already editing block, don't do anything
    if (blockId === editingBlockId) return;

    // Close any currently open editor
    const updatedBlocks = contentBlocks.map((block) => ({
      ...block,
      isEditing: block.id === blockId,
    }));

    setContentBlocks(updatedBlocks);
    setEditingBlockId(blockId);
  };

  // Save content when editor updates
  const handleEditorUpdate = (blockId, content) => {
    const updatedBlocks = contentBlocks.map((block) =>
      block.id === blockId ? { ...block, content } : block
    );
    setContentBlocks(updatedBlocks);
  };

  // Close editor and save content
  const finishEditing = (blockId, content) => {
    // Don't close editor on blur, just update content
    const updatedBlocks = contentBlocks.map((block) =>
      block.id === blockId ? { ...block, content } : block
    );
    setContentBlocks(updatedBlocks);
  };

  // Add a new function to explicitly finish editing
  const closeEditor = () => {
    // This function will be called when clicking outside the editing area
    if (editingBlockId) {
      const updatedBlocks = contentBlocks.map((block) =>
        block.id === editingBlockId ? { ...block, isEditing: false } : block
      );
      setContentBlocks(updatedBlocks);
      setEditingBlockId(null);
    }
  };

  // Update the placeholder function for adding images
  const addImage = () => {
    // Open the image dialog
    setSelectedImageUrl("");
    setImageAltText("");
    setImageDialogOpen(true);
  };

  // Handle image selection
  const handleImageSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileSelected = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("File selected:", file.name);
      setUploadingImage(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        console.log("Image loaded:", imageUrl.substring(0, 50) + "...");
        setSelectedImageUrl(imageUrl);
        setUploadingImage(false);
      };

      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        setUploadingImage(false);
      };

      reader.readAsDataURL(file);
    }
  };

  // Handle image upload confirmation
  const handleImageConfirm = () => {
    if (selectedImageUrl) {
      // Close any currently open editor
      const updatedBlocks = contentBlocks.map((block) => ({
        ...block,
        isEditing: false,
      }));

      // Add new image block
      const newBlock = {
        type: "image",
        id: Date.now(),
        content: selectedImageUrl,
        alt: imageAltText || "Image",
        isEditing: false,
      };

      setContentBlocks([...updatedBlocks, newBlock]);
      setEditingBlockId(null);

      // Reset state and close dialog
      setImageDialogOpen(false);
      setSelectedImageUrl("");
      setImageAltText("");
      setActiveTab(0);
    }
  };

  // Placeholder functions for other content types (to be implemented later)
  const addVideo = () => {
    alert("Video functionality coming soon!");
  };

  const addDocument = () => {
    alert("Document functionality coming soon!");
  };

  const addFlipCards = () => {
    alert("Flip cards functionality coming soon!");
  };

  const addHotspot = () => {
    alert("Hotspot functionality coming soon!");
  };

  const addChecklist = () => {
    alert("Checklist functionality coming soon!");
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle sample image selection
  const handleSampleImageSelect = (url) => {
    setSelectedImageUrl(url);
  };

  // Handle alt text change
  const handleAltTextChange = (e) => {
    setImageAltText(e.target.value);
  };

  // Open image edit menu
  const handleImageMenuOpen = (event, blockId) => {
    event.stopPropagation();
    setImageMenuAnchorEl(event.currentTarget);
    setCurrentEditingImage(blockId);
  };

  // Close image edit menu
  const handleImageMenuClose = () => {
    setImageMenuAnchorEl(null);
    setCurrentEditingImage(null);
  };

  // Open image edit dialog
  const handleEditImage = (blockId) => {
    console.log("Opening edit for image:", blockId);

    const imageBlock = contentBlocks.find((block) => block.id === blockId);
    if (imageBlock) {
      console.log("Found image to edit:", imageBlock.id);
      console.log("Image URL:", imageBlock.content.substring(0, 50) + "...");

      // Make sure to update all the state needed for editing
      setSelectedImageUrl(imageBlock.content);
      setImageAltText(imageBlock.alt || "");
      setImageWidth(imageBlock.width || 100);
      setImageAlignment(imageBlock.alignment || "center");
      setCurrentEditingImage(blockId);

      // Give the state a moment to update before opening the dialog
      setTimeout(() => {
        setActiveTab(1); // Show layout tab by default when editing
        setImageEditDialogOpen(true);
      }, 10);

      handleImageMenuClose();
    } else {
      console.error("Could not find image block with id:", blockId);
    }
  };

  // Modify handleImageEditConfirm to use functional state update
  const handleImageEditConfirm = () => {
    if (currentEditingImage && selectedImageUrl) {
      console.log("Updating image:", currentEditingImage);

      // Use functional update to ensure we're working with the latest state
      setContentBlocks((prevBlocks) => {
        return prevBlocks.map((block) => {
          if (block.id === currentEditingImage) {
            console.log(`Updating block ${block.id} with new image`);
            return {
              ...block,
              content: selectedImageUrl,
              alt: imageAltText || "Image",
              width: imageWidth,
              alignment: imageAlignment,
            };
          }
          return block;
        });
      });

      // Close all relevant dialogs
      setImageEditDialogOpen(false);
      setCropDialogOpen(false);

      // Reset the editing state
      setCurrentEditingImage(null);
    } else {
      console.error("Cannot update image, missing data");

      // Close dialogs even if there's an error
      setImageEditDialogOpen(false);
      setCropDialogOpen(false);
    }
  };

  // Handle image alignment change
  const handleAlignmentChange = (alignment) => {
    setImageAlignment(alignment);
  };

  // Handle image width change
  const handleWidthChange = (event, newValue) => {
    setImageWidth(newValue);
  };

  // Open crop dialog
  const handleOpenCropDialog = () => {
    setCropDialogOpen(true);
    handleImageMenuClose();
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      {/* Course Header */}
      <CourseHeader title={title} courseId={id} />

      {/* Main Content */}
      <Box sx={{ display: "flex", flex: 1 }}>
        {/* Sidebar Toggle Button */}
        <Box
          sx={{
            width: 50,
            height: 50,
            bgcolor: "#fff",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            pt: 2,
          }}
        >
          <IconButton>
            <MenuIcon />
          </IconButton>
        </Box>

        {/* Content Area */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 4,
              width: "100%",
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: 800,
                bgcolor: "#fff",
                borderRadius: 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                p: 4,
                mb: 4,
              }}
            >
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  textAlign: "center",
                  fontWeight: 500,
                  color: "#333",
                  mb: 2,
                }}
              >
                {title}
              </Typography>

              <Divider
                sx={{
                  my: 2,
                  width: 100,
                  mx: "auto",
                  height: 3,
                  bgcolor: dividerColor,
                }}
              />

              {/* Render multiple Tiptap editors or static content */}
              {contentBlocks.map((block, index) => (
                <Box
                  key={block.id}
                  sx={{
                    mb: 4,
                    position: "relative",
                    "&:hover .block-controls": {
                      opacity: 1,
                    },
                  }}
                >
                  {/* Block controls */}
                  <Box
                    className="block-controls"
                    sx={{
                      width: "4%",
                      position: "absolute",
                      top: 0,
                      left: -30,
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                      opacity: 0,
                      transition: "opacity 0.2s ease-in-out",
                      zIndex: 10,
                    }}
                  >
                    <Tooltip title="Drag to reorder" placement="left">
                      <IconButton
                        size="small"
                        sx={{
                          bgcolor: "#f5f5f5",
                          "&:hover": { bgcolor: "#e0e0e0" },
                        }}
                      >
                        <DragIndicatorIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Move up" placement="left">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => moveBlockUp(index)}
                          disabled={index === 0}
                          sx={{
                            bgcolor: "#f5f5f5",
                            "&:hover": { bgcolor: "#e0e0e0" },
                          }}
                        >
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title="Move down" placement="left">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => moveBlockDown(index)}
                          disabled={index === contentBlocks.length - 1}
                          sx={{
                            bgcolor: "#f5f5f5",
                            "&:hover": { bgcolor: "#e0e0e0" },
                          }}
                        >
                          <ArrowDownwardIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title="Delete" placement="left">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => deleteBlock(block.id)}
                          sx={{
                            bgcolor: "#f5f5f5",
                            "&:hover": { bgcolor: "#ffebee" },
                          }}
                        >
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>

                  {/* Render different block types */}
                  {block.type === "text" &&
                    (block.isEditing ? (
                      // Show editor when in editing mode
                      <Box
                        sx={{ position: "relative" }}
                        ref={(el) => (editorRefs.current[block.id] = el)}
                      >
                        <TiptapEditor
                          initialContent={block.content}
                          onUpdate={(content) =>
                            handleEditorUpdate(block.id, content)
                          }
                          onBlur={() => finishEditing(block.id, block.content)}
                        />
                      </Box>
                    ) : (
                      // Show static content when not editing
                      <Box
                        onClick={() => toggleEditMode(block.id)}
                        sx={{
                          cursor: "pointer",
                          p: 2,
                          minHeight: "50px",
                          "&:hover": {
                            bgcolor: "#fafafa",
                          },
                        }}
                        dangerouslySetInnerHTML={{ __html: block.content }}
                      />
                    ))}

                  {block.type === "image" && (
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        border: "1px solid #e0e0e0",
                        borderRadius: 2,
                        overflow: "hidden",
                        p: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: block.alignment || "center",
                          alignItems: "center",
                          width: "100%",
                          position: "relative",
                        }}
                      >
                        <img
                          src={block.content}
                          alt={block.alt || "Image"}
                          style={{
                            width: `${block.width || 100}%`,
                            maxWidth: "100%",
                            height: "auto",
                            display: "block",
                            borderRadius: "4px",
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(0, 0, 0, 0.03)",
                            opacity: 0,
                            transition: "opacity 0.2s",
                            "&:hover": {
                              opacity: 1,
                              cursor: "pointer",
                            },
                          }}
                          onClick={(e) => handleImageMenuOpen(e, block.id)}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              backgroundColor: "rgba(255, 255, 255, 0.9)",
                              borderRadius: 1,
                              p: 1,
                            }}
                          >
                            <Tooltip title="Edit image">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditImage(block.id);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Crop image">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenCropDialog();
                                }}
                              >
                                <CropIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Resize image">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditImage(block.id);
                                }}
                              >
                                <AspectRatioIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Use the new BottomToolbar component */}
          <BottomToolbar
            onAddText={addTextEditor}
            onAddImage={addImage}
            onAddVideo={addVideo}
            onAddDocument={addDocument}
            onAddFlipCards={addFlipCards}
            onAddHotspot={addHotspot}
            onAddChecklist={addChecklist}
          />
        </Box>
      </Box>

      {/* Image Upload Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Insert Image</DialogTitle>
        <DialogContent>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="Upload" />
            <Tab label="Sample Images" />
          </Tabs>

          {activeTab === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={handleImageSelect}
                    disabled={uploadingImage}
                  >
                    Select Image
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    ref={fileInputRef}
                    onChange={handleFileSelected}
                  />

                  {uploadingImage && <CircularProgress size={24} />}

                  {selectedImageUrl && activeTab === 0 && (
                    <Box sx={{ mt: 2, width: "100%", textAlign: "center" }}>
                      <img
                        src={selectedImageUrl}
                        alt="Selected"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "300px",
                          objectFit: "contain",
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Alt Text"
                        placeholder="Describe the image"
                        margin="normal"
                        value={imageAltText}
                        onChange={handleAltTextChange}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Grid container spacing={2}>
              {sampleImages.map((url, index) => (
                <Grid item xs={3} key={index}>
                  <Box
                    sx={{
                      border:
                        selectedImageUrl === url
                          ? "2px solid #2196f3"
                          : "1px solid #e0e0e0",
                      borderRadius: 1,
                      overflow: "hidden",
                      cursor: "pointer",
                      height: 150,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      "&:hover": {
                        opacity: 0.8,
                      },
                    }}
                    onClick={() => handleSampleImageSelect(url)}
                  >
                    <img
                      src={url}
                      alt={`Sample ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                </Grid>
              ))}

              {selectedImageUrl && activeTab === 1 && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Alt Text"
                    placeholder="Describe the image"
                    margin="normal"
                    value={imageAltText}
                    onChange={handleAltTextChange}
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleImageConfirm}
            disabled={!selectedImageUrl || uploadingImage}
            variant="contained"
            color="primary"
          >
            Insert
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Edit Dialog */}
      <Dialog
        open={imageEditDialogOpen}
        onClose={() => setImageEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Image</DialogTitle>
        <DialogContent>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="Change Image" />
            <Tab label="Layout & Size" />
          </Tabs>

          {activeTab === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={handleImageSelect}
                    disabled={uploadingImage}
                  >
                    Select New Image
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    ref={fileInputRef}
                    onChange={handleFileSelected}
                  />

                  {uploadingImage && <CircularProgress size={24} />}

                  {selectedImageUrl && (
                    <Box sx={{ mt: 2, width: "100%", textAlign: "center" }}>
                      <img
                        src={selectedImageUrl}
                        alt="Selected"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "300px",
                          objectFit: "contain",
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Alt Text"
                        placeholder="Describe the image"
                        margin="normal"
                        value={imageAltText}
                        onChange={handleAltTextChange}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ width: "100%", p: 2 }}>
                  <Typography gutterBottom>Image Width</Typography>
                  <Slider
                    value={imageWidth}
                    onChange={handleWidthChange}
                    aria-labelledby="image-width-slider"
                    valueLabelDisplay="auto"
                    step={5}
                    marks
                    min={25}
                    max={100}
                  />

                  <Typography gutterBottom sx={{ mt: 3 }}>
                    Alignment
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <Button
                      variant={
                        imageAlignment === "left" ? "contained" : "outlined"
                      }
                      onClick={() => handleAlignmentChange("left")}
                      startIcon={<FormatAlignLeftIcon />}
                    >
                      Left
                    </Button>
                    <Button
                      variant={
                        imageAlignment === "center" ? "contained" : "outlined"
                      }
                      onClick={() => handleAlignmentChange("center")}
                      startIcon={<FormatAlignCenterIcon />}
                    >
                      Center
                    </Button>
                    <Button
                      variant={
                        imageAlignment === "right" ? "contained" : "outlined"
                      }
                      onClick={() => handleAlignmentChange("right")}
                      startIcon={<FormatAlignRightIcon />}
                    >
                      Right
                    </Button>
                  </Box>

                  <Box sx={{ mt: 4, width: "100%", textAlign: "center" }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Preview
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: imageAlignment,
                        border: "1px dashed #ccc",
                        p: 2,
                      }}
                    >
                      {selectedImageUrl && (
                        <img
                          src={selectedImageUrl}
                          alt={imageAltText || "Preview"}
                          style={{
                            width: `${imageWidth}%`,
                            maxWidth: "100%",
                            height: "auto",
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              handleImageEditConfirm();
              setImageEditDialogOpen(false);
            }}
            disabled={!selectedImageUrl}
            variant="contained"
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Menu */}
      <Menu
        anchorEl={imageMenuAnchorEl}
        open={Boolean(imageMenuAnchorEl)}
        onClose={handleImageMenuClose}
      >
        <MenuItem onClick={() => handleEditImage(currentEditingImage)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit Image
        </MenuItem>
        <MenuItem onClick={handleOpenCropDialog}>
          <CropIcon fontSize="small" sx={{ mr: 1 }} /> Crop Image
        </MenuItem>
        <MenuItem onClick={() => deleteBlock(currentEditingImage)}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} color="error" /> Delete
        </MenuItem>
      </Menu>

      {/* Crop Dialog */}
      <Dialog
        open={cropDialogOpen}
        onClose={() => setCropDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Crop Image</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, textAlign: "center" }}>
            {selectedImageUrl && (
              <img
                src={selectedImageUrl}
                alt="Crop preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "400px",
                  objectFit: "contain",
                }}
              />
            )}
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Crop functionality will be implemented in a future update.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCropDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              handleImageEditConfirm();
              setCropDialogOpen(false);
            }}
            variant="contained"
            color="primary"
          >
            Apply Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
