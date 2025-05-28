import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  TextField,
  Grid,
  Tabs,
  Tab,
  Box,
} from "@mui/material";

// Sample images for the component
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

const ImageUploadDialog = ({
  open,
  onClose,
  onConfirm,
  initialImageUrl = "",
  initialAltText = "",
}) => {
  const [selectedImageUrl, setSelectedImageUrl] = useState(initialImageUrl);
  const [imageAltText, setImageAltText] = useState(initialAltText);
  const [activeTab, setActiveTab] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImageUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle sample image selection
  const handleSampleImageSelect = (url) => {
    setSelectedImageUrl(url);
  };

  // Handle alt text change
  const handleAltTextChange = (e) => {
    setImageAltText(e.target.value);
  };

  // Handle image upload confirmation
  const handleConfirm = () => {
    if (selectedImageUrl) {
      onConfirm({
        imageUrl: selectedImageUrl,
        altText: imageAltText || "Image",
      });
      onClose(); // Explicitly close the dialog after confirmation
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => {
            handleConfirm();
            onClose(); // Force close the dialog regardless of confirmation result
          }}
          disabled={!selectedImageUrl || uploadingImage}
          variant="contained"
          color="primary"
        >
          Insert
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageUploadDialog;
