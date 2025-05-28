import React from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";

import TextFieldsIcon from "@mui/icons-material/TextFields";
import ImageIcon from "@mui/icons-material/Image";
import VideocamIcon from "@mui/icons-material/Videocam";
import DescriptionIcon from "@mui/icons-material/Description";
import FlipToFrontIcon from "@mui/icons-material/FlipToFront";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import ChecklistIcon from "@mui/icons-material/Checklist";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

const BottomToolbar = ({
  onAddText,
  onAddImage,
  onAddVideo,
  onAddDocument,
  onAddFlipCards,
  onAddHotspot,
  onAddChecklist,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 3,
        p: 1.5,
        mt: 2,
        mb: 2,
        bgcolor: "#fff",
        width: "45%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          p: 0.5,
          border: "1px solid #e0e0e0",
          borderRadius: 1,
          bgcolor: "#fff",
          width: "100%",
          pr: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "95%",
            pr: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              height: 35,
            }}
          >
            <Button
              onClick={onAddText}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "#000",
                bgcolor: "#f0f7ff",
                "&:hover": {
                  bgcolor: "#e1f0ff",
                },
              }}
            >
              <TextFieldsIcon fontSize="small" />
              <Typography sx={{ fontSize: "0.7rem" }}>Text</Typography>
            </Button>

            <Button
              onClick={onAddImage}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "#000",
                "&:hover": {
                  bgcolor: "#f5f5f5",
                },
              }}
            >
              <ImageIcon fontSize="small" />
              <Typography sx={{ fontSize: "0.7rem" }}>Image</Typography>
            </Button>

            <Button
              onClick={onAddVideo}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "#000",
              }}
            >
              <VideocamIcon fontSize="small" />
              <Typography sx={{ fontSize: "0.7rem" }}>Video</Typography>
            </Button>

            <Button
              onClick={onAddDocument}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "#000",
              }}
            >
              <DescriptionIcon fontSize="small" />
              <Typography sx={{ fontSize: "0.7rem" }}>Document</Typography>
            </Button>

            <Button
              onClick={onAddFlipCards}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "#000",
              }}
            >
              <FlipToFrontIcon fontSize="small" />
              <Typography sx={{ fontSize: "0.7rem" }}>
                Flip&nbsp;cards
              </Typography>
            </Button>

            <Button
              onClick={onAddHotspot}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "#000",
              }}
            >
              <WhatshotIcon fontSize="small" />
              <Typography sx={{ fontSize: "0.7rem" }}>Hotspot</Typography>
            </Button>

            <Button
              onClick={onAddChecklist}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "#000",
              }}
            >
              <ChecklistIcon fontSize="small" />
              <Typography sx={{ fontSize: "0.7rem" }}>Checklist</Typography>
            </Button>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          p: 0.5,
          width: "8%",
          border: "1px solid #e0e0e0",
          borderRadius: 1,
        }}
      >
        <Button sx={{ width: 20, height: 35, color: "#000" }}>
          <MoreHorizIcon fontSize="small" />
        </Button>
      </Box>
    </Box>
  );
};

// Default props with empty functions to prevent errors
BottomToolbar.defaultProps = {
  onAddText: () => {},
  onAddImage: () => {},
  onAddVideo: () => {},
  onAddDocument: () => {},
  onAddFlipCards: () => {},
  onAddHotspot: () => {},
  onAddChecklist: () => {},
};

export default BottomToolbar;
