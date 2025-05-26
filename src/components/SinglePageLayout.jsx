import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Divider,
  Paper,
  IconButton,
} from "@mui/material";

import TextFieldsIcon from "@mui/icons-material/TextFields";
import ImageIcon from "@mui/icons-material/Image";
import VideocamIcon from "@mui/icons-material/Videocam";
import DescriptionIcon from "@mui/icons-material/Description";
import FlipToFrontIcon from "@mui/icons-material/FlipToFront";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import ChecklistIcon from "@mui/icons-material/Checklist";
import MenuIcon from "@mui/icons-material/Menu";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

// Import the separate TiptapEditor component
import TiptapEditor from "./TiptapEditor";
import CourseHeader from "./CourseHeader";

export const SinglePageLayout = () => {
  const { id } = useParams();
  const location = useLocation();

  const courseData = location.state?.courseData || { title: "Untitled course" };
  const [title] = useState(courseData.title);
  const [dividerColor] = useState("#f5756c");

  const [showEditor, setShowEditor] = useState(true);

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

              {/* Tiptap Rich Text Editor */}
              {showEditor && <TiptapEditor />}
            </Box>
          </Box>

          {/* Bottom Toolbar */}
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
                    onClick={() => setShowEditor(true)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      color: "#000",
                      bgcolor: showEditor ? "#f0f7ff" : "transparent",
                      "&:hover": {
                        bgcolor: showEditor ? "#e1f0ff" : "#f5f5f5",
                      },
                    }}
                  >
                    <TextFieldsIcon fontSize="small" />
                    <Typography sx={{ fontSize: "0.7rem" }}>Text</Typography>
                  </Button>

                  <Button
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      color: "#000",
                    }}
                  >
                    <ImageIcon fontSize="small" />
                    <Typography sx={{ fontSize: "0.7rem" }}>Image</Typography>
                  </Button>

                  <Button
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
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      color: "#000",
                    }}
                  >
                    <DescriptionIcon fontSize="small" />
                    <Typography sx={{ fontSize: "0.7rem" }}>
                      Document
                    </Typography>
                  </Button>

                  <Button
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
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      color: "#000",
                    }}
                  >
                    <ChecklistIcon fontSize="small" />
                    <Typography sx={{ fontSize: "0.7rem" }}>
                      Checklist
                    </Typography>
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
        </Box>
      </Box>
    </Box>
  );
};
