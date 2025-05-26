import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Box,
  Button,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const CreateCourseDialog = ({ open, onClose, onCreateCourse }) => {
  const [courseTitle, setCourseTitle] = useState("");
  const [selectedLayout, setSelectedLayout] = useState("multi-page");
  const navigate = useNavigate();

  const handleCreateCourse = () => {
    const courseData = {
      title: courseTitle.trim() === "" ? "Untitled course" : courseTitle,
      layout: selectedLayout,
      id: Date.now(), // Simple temporary ID for demo purposes
    };

    // Let the parent component handle the course creation and navigation
    onCreateCourse(courseData);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          maxWidth: "700px",
          p: 0,
          m: 2,
          overflow: "hidden",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          zIndex: 1,
        }}
      >
        <Button
          onClick={onClose}
          size="small"
          sx={{
            bgcolor: "transparent",
            color: "#333",
            width: "20px",
            height: "20px",
            py: 4,
            "&:hover": {
              bgcolor: "transparent",
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </Button>
      </Box>

      <Box sx={{ pb: 5, px: 3 }}>
        <DialogTitle sx={{ p: 0, mb: 1, textAlign: "center" }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: "#333" }}>
            Create your course from scratch
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 0, px: 3 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", mb: 3, fontSize: "0.95rem", px: 5 }}
          >
            Enter a title and pick a layout that best suits your course
            requirements. You can switch layouts later if you change your mind
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Enter course title..."
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: "4px",
              },
            }}
          />

          <Box
            sx={{
              maxHeight: "300px",
              //   overflow: "auto",
              mb: 2,
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "#f0f0f0",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#c1c1c1",
                borderRadius: "10px",
              },
            }}
          >
            <RadioGroup
              value={selectedLayout}
              onChange={(e) => setSelectedLayout(e.target.value)}
              sx={{ width: "100%" }}
            >
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                {/* Multi-page layout option */}
                <Box
                  sx={{
                    flex: 1,
                    border: "1px solid",
                    borderColor:
                      selectedLayout === "multi-page" ? "#43b77a" : "#e0e0e0",
                    borderRadius: "4px",
                    cursor: "pointer",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onClick={() => setSelectedLayout("multi-page")}
                >
                  <FormControlLabel
                    value="multi-page"
                    control={
                      <Radio
                        sx={{
                          position: "absolute",
                          top: "10px",
                          left: "10px",
                          color: "#ccc",
                          "&.Mui-checked": {
                            color: "#43b77a",
                          },
                        }}
                      />
                    }
                    label=""
                    sx={{ m: 0, width: "100%", height: "100%" }}
                  />

                  <Box sx={{ textAlign: "center", p: 3, pt: 4 }}>
                    <Box
                      component="img"
                      src="/images/multi-page-layout.svg"
                      alt="Multi-page layout"
                      sx={{
                        width: "70px",
                        height: "70px",
                        mb: 1.5,
                        opacity: 0.8,
                      }}
                    />
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 500, mb: 0.5, fontSize: "0.95rem" }}
                    >
                      Multi-page layout
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.85rem" }}
                    >
                      A full-length course, covering multiple topics
                    </Typography>
                  </Box>
                </Box>

                {/* Single-page layout option */}
                <Box
                  sx={{
                    flex: 1,
                    border: "1px solid",
                    borderColor:
                      selectedLayout === "single-page" ? "#43b77a" : "#e0e0e0",
                    borderRadius: "4px",
                    cursor: "pointer",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onClick={() => setSelectedLayout("single-page")}
                >
                  <FormControlLabel
                    value="single-page"
                    control={
                      <Radio
                        sx={{
                          position: "absolute",
                          top: "10px",
                          left: "10px",
                          color: "#ccc",
                          "&.Mui-checked": {
                            color: "#43b77a",
                          },
                        }}
                      />
                    }
                    label=""
                    sx={{ m: 0, width: "100%", height: "100%" }}
                  />

                  <Box sx={{ textAlign: "center", p: 3, pt: 4 }}>
                    <Box
                      component="img"
                      src="/images/single-page-layout.svg"
                      alt="Single-page layout"
                      sx={{
                        width: "70px",
                        height: "70px",
                        mb: 1.5,
                        opacity: 0.8,
                      }}
                    />
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 500, mb: 0.5, fontSize: "0.95rem" }}
                    >
                      Single-page layout
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.85rem" }}
                    >
                      A short, focused course designed for quick learning
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </RadioGroup>
          </Box>
        </DialogContent>

        <Box
          sx={{
            px: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            variant="contained"
            onClick={handleCreateCourse}
            // disabled={courseTitle.trim() === ""}
            fullWidth
            endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
            sx={{
              width: 150,
              height: 40,

              fontSize: 14,
              mt: 1,
              bgcolor: "#43b77a",
              color: "#fff",
              borderRadius: "20px",
              py: 1.5,
              fontWeight: 500,
              textTransform: "none",
              justifyContent: "space-between",
              px: 3,
              "&:hover": {
                bgcolor: "#3aa068",
              },
              "&.Mui-disabled": {
                bgcolor: "#e0e0e0",
                color: "#999",
              },
            }}
          >
            Start&nbsp;creating
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default CreateCourseDialog;
