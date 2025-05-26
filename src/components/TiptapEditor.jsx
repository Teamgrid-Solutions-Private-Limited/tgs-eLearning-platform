import React, { useState, useRef } from "react";
import {
  Box,
  Paper,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  Popper,
  ClickAwayListener,
  MenuList,
  Grow,
  Select,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
} from "@mui/material";

// Add custom styled tooltip component for better looks
import { styled } from "@mui/material/styles";

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import CodeIcon from "@mui/icons-material/Code";
import SuperscriptIcon from "@mui/icons-material/Superscript";
import SubscriptIcon from "@mui/icons-material/Subscript";
import LinkIcon from "@mui/icons-material/Link";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import FormatClearIcon from "@mui/icons-material/FormatClear";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

// Import Tiptap
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Link from "@tiptap/extension-link";
import Code from "@tiptap/extension-code";
import Strike from "@tiptap/extension-strike";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Heading from "@tiptap/extension-heading";
// Add table extensions
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import HorizontalRule from "@tiptap/extension-horizontal-rule";

// Additional icons
import TableChartIcon from "@mui/icons-material/TableChart";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";

// Styled Tooltip for better appearance
const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .MuiTooltip-tooltip`]: {
    backgroundColor: "rgba(40, 40, 40, 0.95)",
    color: "#fff",
    fontSize: "0.85rem",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: 500,
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
    maxWidth: 180,
    textAlign: "center",
    "&.MuiTooltip-tooltipPlacementTop": {
      marginBottom: "10px",
    },
    "&.MuiTooltip-tooltipPlacementBottom": {
      marginTop: "10px",
    },
  },
  [`& .MuiTooltip-arrow`]: {
    color: "rgba(40, 40, 40, 0.95)",
    fontSize: "20px",
  },
}));

// Color palette for text and highlight
const colorPalette = [
  "#000000",
  "#434343",
  "#666666",
  "#999999",
  "#b7b7b7",
  "#cccccc",
  "#d9d9d9",
  "#efefef",
  "#f3f3f3",
  "#ffffff",
  "#980000",
  "#ff0000",
  "#ff9900",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#4a86e8",
  "#0000ff",
  "#9900ff",
  "#ff00ff",
  "#e6b8af",
  "#f4cccc",
  "#fce5cd",
  "#fff2cc",
  "#d9ead3",
  "#d0e0e3",
  "#c9daf8",
  "#cfe2f3",
  "#d9d2e9",
  "#ead1dc",
];

// Tooltip props for consistent styling
const tooltipProps = {
  arrow: true,
  placement: "top",
  enterDelay: 100,
  leaveDelay: 200,
  componentsProps: {
    tooltip: {
      sx: {
        border: "1px solid rgba(255,255,255,0.2)",
      },
    },
  },
};

// Tiptap custom editor component
const TiptapEditor = () => {
  const [textColorAnchor, setTextColorAnchor] = useState(null);
  const [highlightColorAnchor, setHighlightColorAnchor] = useState(null);
  const [formatMenuAnchor, setFormatMenuAnchor] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState("Normal");
  // Add state for table dialog
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableColumns, setTableColumns] = useState(3);
  const [tableWithHeader, setTableWithHeader] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Disable the heading from StarterKit to use our custom heading
        code: false, // Disable code from StarterKit
        horizontalRule: false, // Disable horizontalRule from StarterKit
        strike: false, // Disable strike from StarterKit
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Superscript,
      Subscript,
      Code,
      Link.configure({
        openOnClick: true,
      }),
      Strike,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Heading.configure({
        levels: [1, 2, 3, 4],
      }),
      // Add table and horizontal rule extensions
      Table.configure({
        resizable: false,
      }),
      TableRow,
      TableHeader,
      TableCell,
      HorizontalRule,
    ],
    content: "<p>Hello World! This is a Tiptap editor.</p>",
    editorProps: {
      attributes: {
        class: "tiptap-editor",
      },
    },
    onUpdate: ({ editor }) => {
      // Update the selected format based on current node
      updateSelectedFormat(editor);
    },
  });

  if (!editor) {
    return null;
  }

  const updateSelectedFormat = (editor) => {
    if (editor.isActive("heading", { level: 1 })) {
      setSelectedFormat("Heading 1");
    } else if (editor.isActive("heading", { level: 2 })) {
      setSelectedFormat("Heading 2");
    } else if (editor.isActive("heading", { level: 3 })) {
      setSelectedFormat("Heading 3");
    } else if (editor.isActive("heading", { level: 4 })) {
      setSelectedFormat("Heading 4");
    } else if (editor.isActive("blockquote")) {
      setSelectedFormat("Quote");
    } else {
      setSelectedFormat("Normal");
    }
  };

  const setLink = () => {
    const url = window.prompt("URL");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
  };

  const handleTextColorClick = (event) => {
    setTextColorAnchor(event.currentTarget);
  };

  const handleTextColorClose = () => {
    setTextColorAnchor(null);
  };

  const handleHighlightColorClick = (event) => {
    setHighlightColorAnchor(event.currentTarget);
  };

  const handleHighlightColorClose = () => {
    setHighlightColorAnchor(null);
  };

  const setTextColor = (color) => {
    editor.chain().focus().setColor(color).run();
    handleTextColorClose();
  };

  const setHighlightColor = (color) => {
    editor.chain().focus().setHighlight({ color }).run();
    handleHighlightColorClose();
  };

  const clearFormatting = () => {
    editor
      .chain()
      .focus()
      .unsetBold()
      .unsetItalic()
      .unsetUnderline()
      .unsetStrike()
      .unsetCode()
      .unsetSuperscript()
      .unsetSubscript()
      .unsetHighlight()
      .unsetColor()
      .run();
  };

  const handleFormatMenuClick = (event) => {
    setFormatMenuAnchor(event.currentTarget);
  };

  const handleFormatMenuClose = () => {
    setFormatMenuAnchor(null);
  };

  const handleFormatChange = (format) => {
    if (format === "Normal") {
      editor.chain().focus().setParagraph().run();
    } else if (format.startsWith("Heading")) {
      const level = parseInt(format.split(" ")[1]);
      editor.chain().focus().toggleHeading({ level }).run();
    } else if (format === "Quote") {
      editor.chain().focus().toggleBlockquote().run();
    }
    setSelectedFormat(format);
    handleFormatMenuClose();
  };

  // Add helper functions for table and horizontal rule
  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({
        rows: tableRows,
        cols: tableColumns,
        withHeaderRow: tableWithHeader,
      })
      .run();
    setTableDialogOpen(false);
  };

  const openTableDialog = () => {
    setTableDialogOpen(true);
  };

  const handleTableDialogClose = () => {
    setTableDialogOpen(false);
  };

  const insertHorizontalRule = () => {
    editor.chain().focus().setHorizontalRule().run();
  };

  return (
    <Box className="tiptap-editor-wrapper">
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "4px",
          bgcolor: "#fff",
          border: "1px solid #e0e0e0",
          position: "relative",
          my: 2,
        }}
      >
        {/* Toolbar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: 1,
            py: 0.5,
            borderBottom: "1px solid #e0e0e0",
            bgcolor: "#fff",
            borderTopLeftRadius: "4px",
            borderTopRightRadius: "4px",
            flexWrap: "wrap",
            gap: 0.5,
          }}
        >
          {/* Paragraph Format Dropdown */}
          <Box
            onClick={handleFormatMenuClick}
            sx={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #ddd",
              borderRadius: 1,
              px: 1,
              py: 0.5,
              cursor: "pointer",
              mr: 1,
              width: 100,
              bgcolor: "#fff",
              height: 26,
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontSize: "0.8rem", flexGrow: 1 }}
            >
              {selectedFormat}
            </Typography>
            <ArrowDropDownIcon fontSize="small" />
          </Box>
          <Menu
            anchorEl={formatMenuAnchor}
            open={Boolean(formatMenuAnchor)}
            onClose={handleFormatMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            PaperProps={{
              style: {
                width: 150,
                boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                borderRadius: "8px",
              },
            }}
          >
            <MenuItem
              onClick={() => handleFormatChange("Normal")}
              selected={selectedFormat === "Normal"}
            >
              Normal
            </MenuItem>
            <MenuItem
              onClick={() => handleFormatChange("Heading 1")}
              selected={selectedFormat === "Heading 1"}
              sx={{ fontSize: "1.5rem", fontWeight: "bold" }}
            >
              Heading 1
            </MenuItem>
            <MenuItem
              onClick={() => handleFormatChange("Heading 2")}
              selected={selectedFormat === "Heading 2"}
              sx={{ fontSize: "1.3rem", fontWeight: "bold" }}
            >
              Heading 2
            </MenuItem>
            <MenuItem
              onClick={() => handleFormatChange("Heading 3")}
              selected={selectedFormat === "Heading 3"}
              sx={{ fontSize: "1.15rem", fontWeight: "bold" }}
            >
              Heading 3
            </MenuItem>
            <MenuItem
              onClick={() => handleFormatChange("Heading 4")}
              selected={selectedFormat === "Heading 4"}
              sx={{ fontSize: "1rem", fontWeight: "bold" }}
            >
              Heading 4
            </MenuItem>
            <MenuItem
              onClick={() => handleFormatChange("Quote")}
              selected={selectedFormat === "Quote"}
              sx={{
                borderLeft: "3px solid #ccc",
                pl: 1,
                fontStyle: "italic",
              }}
            >
              Quote
            </MenuItem>
          </Menu>

          <StyledTooltip
            title="Bold"
            arrow
            placement="top"
            enterDelay={100}
            leaveDelay={200}
            componentsProps={{
              tooltip: {
                sx: {
                  border: "1px solid rgba(255,255,255,0.2)",
                },
              },
            }}
          >
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive("bold") ? "is-active" : ""}
              sx={{
                width: 30,
                height: 30,
                p: 0.5,
                m: 0,
                bgcolor: editor.isActive("bold")
                  ? "rgba(0, 0, 0, 0.1)"
                  : "transparent",
              }}
            >
              <FormatBoldIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </StyledTooltip>

          <StyledTooltip
            title="Italic"
            arrow
            placement="top"
            enterDelay={100}
            leaveDelay={200}
            componentsProps={{
              tooltip: {
                sx: {
                  border: "1px solid rgba(255,255,255,0.2)",
                },
              },
            }}
          >
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive("italic") ? "is-active" : ""}
              sx={{
                width: 30,
                height: 30,
                p: 0.5,
                m: 0,
                bgcolor: editor.isActive("italic")
                  ? "rgba(0, 0, 0, 0.1)"
                  : "transparent",
              }}
            >
              <FormatItalicIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </StyledTooltip>

          <StyledTooltip title="Underline" {...tooltipProps}>
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={editor.isActive("underline") ? "is-active" : ""}
              sx={{
                width: 30,
                height: 30,
                p: 0.5,
                m: 0,
                bgcolor: editor.isActive("underline")
                  ? "rgba(0, 0, 0, 0.1)"
                  : "transparent",
              }}
            >
              <FormatUnderlinedIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </StyledTooltip>

          <StyledTooltip title="Strikethrough" {...tooltipProps}>
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive("strike") ? "is-active" : ""}
              sx={{
                width: 30,
                height: 30,
                p: 0.5,
                m: 0,
                bgcolor: editor.isActive("strike")
                  ? "rgba(0, 0, 0, 0.1)"
                  : "transparent",
              }}
            >
              <StrikethroughSIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </StyledTooltip>

          <StyledTooltip title="Insert Link" {...tooltipProps}>
            <IconButton
              size="small"
              onClick={setLink}
              className={editor.isActive("link") ? "is-active" : ""}
              sx={{
                width: 30,
                height: 30,
                p: 0.5,
                m: 0,
                bgcolor: editor.isActive("link")
                  ? "rgba(0, 0, 0, 0.1)"
                  : "transparent",
              }}
            >
              <LinkIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </StyledTooltip>

          <StyledTooltip title="Align Left" {...tooltipProps}>
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={
                editor.isActive({ textAlign: "left" }) ? "is-active" : ""
              }
              sx={{
                width: 30,
                height: 30,
                p: 0.5,
                m: 0,
                bgcolor: editor.isActive({ textAlign: "left" })
                  ? "rgba(0, 0, 0, 0.1)"
                  : "transparent",
              }}
            >
              <FormatAlignLeftIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </StyledTooltip>

          <StyledTooltip title="Align Center" {...tooltipProps}>
            <IconButton
              size="small"
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              className={
                editor.isActive({ textAlign: "center" }) ? "is-active" : ""
              }
              sx={{
                width: 30,
                height: 30,
                p: 0.5,
                m: 0,
                bgcolor: editor.isActive({ textAlign: "center" })
                  ? "rgba(0, 0, 0, 0.1)"
                  : "transparent",
              }}
            >
              <FormatAlignCenterIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </StyledTooltip>

          <StyledTooltip title="Align Right" {...tooltipProps}>
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={
                editor.isActive({ textAlign: "right" }) ? "is-active" : ""
              }
              sx={{
                width: 30,
                height: 30,
                p: 0.5,
                m: 0,
                bgcolor: editor.isActive({ textAlign: "right" })
                  ? "rgba(0, 0, 0, 0.1)"
                  : "transparent",
              }}
            >
              <FormatAlignRightIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </StyledTooltip>

          <StyledTooltip title="Numbered List" {...tooltipProps}>
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive("orderedList") ? "is-active" : ""}
              sx={{
                width: 30,
                height: 30,
                p: 0.5,
                m: 0,
                bgcolor: editor.isActive("orderedList")
                  ? "rgba(0, 0, 0, 0.1)"
                  : "transparent",
              }}
            >
              <FormatListNumberedIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </StyledTooltip>

          <StyledTooltip title="Bullet List" {...tooltipProps}>
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive("bulletList") ? "is-active" : ""}
              sx={{
                width: 30,
                height: 30,
                p: 0.5,
                m: 0,
                bgcolor: editor.isActive("bulletList")
                  ? "rgba(0, 0, 0, 0.1)"
                  : "transparent",
              }}
            >
              <FormatListBulletedIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </StyledTooltip>

          <StyledTooltip title="Code" {...tooltipProps}>
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={editor.isActive("code") ? "is-active" : ""}
              sx={{
                width: 30,
                height: 30,
                p: 0.5,
                m: 0,
                bgcolor: editor.isActive("code")
                  ? "rgba(0, 0, 0, 0.1)"
                  : "transparent",
              }}
            >
              <CodeIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </StyledTooltip>

          <StyledTooltip title="Superscript" {...tooltipProps}>
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              className={editor.isActive("superscript") ? "is-active" : ""}
              sx={{
                width: 30,
                height: 30,
                p: 0.5,
                m: 0,
                bgcolor: editor.isActive("superscript")
                  ? "rgba(0, 0, 0, 0.1)"
                  : "transparent",
              }}
            >
              <SuperscriptIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </StyledTooltip>

          <StyledTooltip title="Subscript" {...tooltipProps}>
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              className={editor.isActive("subscript") ? "is-active" : ""}
              sx={{
                width: 30,
                height: 30,
                p: 0.5,
                m: 0,
                bgcolor: editor.isActive("subscript")
                  ? "rgba(0, 0, 0, 0.1)"
                  : "transparent",
              }}
            >
              <SubscriptIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </StyledTooltip>

          {/* Text Color */}
          <StyledTooltip title="Text Color" {...tooltipProps}>
            <IconButton
              size="small"
              onClick={handleTextColorClick}
              sx={{
                width: 30,
                height: 30,
                p: 0.5,
                m: 0,
              }}
            >
              <FormatColorTextIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </StyledTooltip>

          <Menu
            anchorEl={textColorAnchor}
            open={Boolean(textColorAnchor)}
            onClose={handleTextColorClose}
            sx={{ width: "15%" }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
            PaperProps={{
              style: {
                boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                borderRadius: "8px",
                padding: "4px",
              },
            }}
          >
            <Box
              sx={{ display: "flex", flexWrap: "wrap", width: "100%", p: 1 }}
            >
              {colorPalette.map((color) => (
                <Box
                  key={color}
                  onClick={() => setTextColor(color)}
                  sx={{
                    width: 20,
                    height: 20,
                    bgcolor: color,
                    m: 0.2,
                    border: "1px solid #ccc",
                    cursor: "pointer",
                    "&:hover": {
                      opacity: 0.8,
                      transform: "scale(1.1)",
                      transition: "all 0.2s ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    },
                  }}
                />
              ))}
            </Box>
          </Menu>

          {/* Highlight Color */}
          <StyledTooltip title="Highlight Color" {...tooltipProps}>
            <IconButton
              size="small"
              onClick={handleHighlightColorClick}
              sx={{
                width: 30,
                height: 30,
                p: 0.5,
                m: 0,
              }}
            >
              <FormatColorFillIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </StyledTooltip>

          <Menu
            anchorEl={highlightColorAnchor}
            open={Boolean(highlightColorAnchor)}
            onClose={handleHighlightColorClose}
            sx={{ width: "15%" }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
            PaperProps={{
              style: {
                boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                borderRadius: "8px",
                padding: "4px",
              },
            }}
          >
            <Box
              sx={{ display: "flex", flexWrap: "wrap", width: "100%", p: 1 }}
            >
              {colorPalette.map((color) => (
                <Box
                  key={color}
                  onClick={() => setHighlightColor(color)}
                  sx={{
                    width: 20,
                    height: 20,
                    bgcolor: color,
                    m: 0.2,
                    border: "1px solid #ccc",
                    cursor: "pointer",
                    "&:hover": {
                      opacity: 0.8,
                      transform: "scale(1.1)",
                      transition: "all 0.2s ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    },
                  }}
                />
              ))}
            </Box>
          </Menu>

          {/* Clear Formatting */}
          <StyledTooltip title="Clear All Formatting" {...tooltipProps}>
            <IconButton
              size="small"
              onClick={clearFormatting}
              sx={{
                width: 30,
                height: 30,
                p: 0.5,
                m: 0,
              }}
            >
              <FormatClearIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </StyledTooltip>

          {/* Horizontal divider */}
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Table */}
          <StyledTooltip title="Insert Table" {...tooltipProps}>
            <IconButton
              size="small"
              onClick={openTableDialog}
              sx={{
                width: 30,
                height: 30,
                p: 0.5,
                m: 0,
              }}
            >
              <TableChartIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </StyledTooltip>

          {/* Horizontal Rule */}
          <StyledTooltip title="Horizontal Line" {...tooltipProps}>
            <IconButton
              size="small"
              onClick={insertHorizontalRule}
              sx={{
                width: 30,
                height: 30,
                p: 0.5,
                m: 0,
              }}
            >
              <HorizontalRuleIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </StyledTooltip>

          {/* Icons */}
          <StyledTooltip title="Insert Emoji" {...tooltipProps}>
            <IconButton
              size="small"
              onClick={() =>
                window.alert("Emoji picker functionality to be implemented")
              }
              sx={{
                width: 30,
                height: 30,
                p: 0.5,
                m: 0,
              }}
            >
              <InsertEmoticonIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </StyledTooltip>

          {/* Image */}
          <StyledTooltip title="Insert Image" {...tooltipProps}>
            <IconButton
              size="small"
              onClick={() =>
                window.alert("Image upload functionality to be implemented")
              }
              sx={{
                width: 30,
                height: 30,
                p: 0.5,
                m: 0,
              }}
            >
              <InsertPhotoIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </StyledTooltip>

          {/* Video */}
          <StyledTooltip title="Insert Video" {...tooltipProps}>
            <IconButton
              size="small"
              onClick={() =>
                window.alert("Video embed functionality to be implemented")
              }
              sx={{
                width: 30,
                height: 30,
                p: 0.5,
                m: 0,
              }}
            >
              <VideoLibraryIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </StyledTooltip>
        </Box>

        <Box
          sx={{
            bgcolor: "#fffef7",
            minHeight: "200px",
            "& .ProseMirror": {
              padding: "16px",
              outline: "none",
              "&:focus": {
                outline: "none",
              },
            },
            "& .ProseMirror p": {
              margin: "0 0 0.75em 0",
            },
            "& .ProseMirror h1": {
              fontSize: "1.75rem",
              fontWeight: "bold",
              margin: "1em 0 0.5em 0",
            },
            "& .ProseMirror h2": {
              fontSize: "1.5rem",
              fontWeight: "bold",
              margin: "1em 0 0.5em 0",
            },
            "& .ProseMirror h3": {
              fontSize: "1.25rem",
              fontWeight: "bold",
              margin: "1em 0 0.5em 0",
            },
            "& .ProseMirror h4": {
              fontSize: "1.1rem",
              fontWeight: "bold",
              margin: "1em 0 0.5em 0",
            },
            "& .ProseMirror blockquote": {
              borderLeft: "3px solid #ccc",
              paddingLeft: "1em",
              fontStyle: "italic",
              margin: "1em 0",
            },
            "& .ProseMirror hr": {
              border: "none",
              borderTop: "2px solid #ccc",
              margin: "1em 0",
            },
            "& .ProseMirror table": {
              borderCollapse: "collapse",
              tableLayout: "fixed",
              width: "100%",
              margin: "1em 0",
              overflow: "hidden",
            },
            "& .ProseMirror th": {
              backgroundColor: "#f7f7f7",
              fontWeight: "bold",
              padding: "8px",
              border: "1px solid #ddd",
            },
            "& .ProseMirror td": {
              padding: "8px",
              border: "1px solid #ddd",
              verticalAlign: "top",
            },
          }}
        >
          <EditorContent editor={editor} />
        </Box>

        {/* Table Insert Dialog */}
        <Dialog
          sx={{
            "& .MuiDialog-paper": {
              width: "25%",
            },
          }}
          open={tableDialogOpen}
          onClose={handleTableDialogClose}
        >
          <DialogTitle>Insert Table</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Specify the number of rows and columns for your table.
            </DialogContentText>
            <Box
              sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                label="Rows"
                type="number"
                value={tableRows}
                onChange={(e) =>
                  setTableRows(Math.max(1, parseInt(e.target.value) || 1))
                }
                inputProps={{ min: 1, max: 20 }}
                fullWidth
              />
              <TextField
                label="Columns"
                type="number"
                value={tableColumns}
                onChange={(e) =>
                  setTableColumns(Math.max(1, parseInt(e.target.value) || 1))
                }
                inputProps={{ min: 1, max: 10 }}
                fullWidth
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tableWithHeader}
                    onChange={(e) => setTableWithHeader(e.target.checked)}
                    sx={{
                      width: 20,
                      height: 20,
                      px: 3,
                    }}
                  />
                }
                label="Include header row"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleTableDialogClose}>Cancel</Button>
            <Button onClick={insertTable} variant="contained">
              Insert
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default TiptapEditor;
