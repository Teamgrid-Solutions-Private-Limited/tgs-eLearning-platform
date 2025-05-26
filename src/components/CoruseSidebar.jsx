import { Box, Button, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { BsFolder2 } from "react-icons/bs";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { IoAddOutline } from "react-icons/io5";
import CreateCourseOptions from "./CreateCourseOptions";
import CreateCourseDialog from "./CreateCourseDialog";

function CoruseSidebar() {
  const [showCreateOptions, setShowCreateOptions] = React.useState(false);
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const navigate = useNavigate();

  const handleCreateCourse = (courseData) => {
    console.log("Creating course:", courseData);

    // Navigate directly to the SinglePageLayout if it's a single-page layout
    if (courseData.layout === "single-page") {
      navigate(`/course/edit/${courseData.id}`, { state: { courseData } });
    }
  };

  return (
    <Box
      sx={{
        width: 280,
        bgcolor: "#fbfbfb",
        borderRight: "1px solid #e0e0e0",
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        position: "relative",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 3,
        }}
      >
        {/* Create Course Button */}
        <Button
          variant="contained"
          onClick={() => setShowCreateOptions(!showCreateOptions)}
          sx={{
            bgcolor: "#43b77a",
            color: "#fff",
            textTransform: "none",
            borderRadius: "20px",
            width: 170,
            // py: 1.2,
            fontWeight: 600,
            fontSize: 15,
            "&:hover": {
              bgcolor: "#3aa068",
            },
          }}
        >
          Create course
        </Button>
      </Box>

      {/* Create Course Options Popup */}
      {showCreateOptions && (
        <CreateCourseOptions
          onClose={() => setShowCreateOptions(false)}
          topPosition="92px"
          rightPosition="45px"
          anchor="left"
          onOptionSelect={(option) => {
            setShowCreateOptions(false);
            if (option === "Start from scratch") {
              setShowCreateDialog(true);
            }
          }}
        />
      )}

      {/* Create Course Dialog */}
      <CreateCourseDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreateCourse={handleCreateCourse}
      />

      {/* My courses section */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <BsFolder2 size={16} color="#666" />
          <Typography
            sx={{
              fontWeight: 400,
              fontSize: "0.875rem",
              color: "#444",
              flex: 5,
            }}
          >
            My&nbsp;courses
          </Typography>
          <Typography
            sx={{
              color: "#666",
              fontSize: "0.75rem",
            }}
          >
            9
          </Typography>
        </Box>

        {/* AI Folder */}
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <BsFolder2 size={16} color="#666" />
          <Typography
            sx={{
              fontWeight: 400,
              fontSize: "0.875rem",
              color: "#444",
              flex: 5,
            }}
          >
            Javascript
          </Typography>
          <Typography
            sx={{
              color: "#666",
              fontSize: "0.75rem",
            }}
          ></Typography>
        </Box>

        <Button
          variant="outlined"
          sx={{
            color: "#666",
            borderColor: "#e0e0e0",
            textTransform: "none",
            justifyContent: "center",
            fontSize: "0.875rem",
            py: 0.8,
            px: 2,
            mt: 1,
            width: "100%",
            "&:hover": {
              borderColor: "#bdbdbd",
              bgcolor: "transparent",
            },
          }}
        >
          New folder
        </Button>
      </Box>

      <Box sx={{ borderBottom: "1px solid #e0e0e0", p: 1, width: "100%" }} />

      {/* Shared courses section */}
      <Box
        sx={{ width: "100%", display: "flex", alignItems: "center", gap: 1.5 }}
      >
        <HiOutlineUserGroup size={16} color="#666" />
        <Typography
          sx={{
            fontWeight: 400,
            fontSize: "0.875rem",
            color: "#444",
            flex: 1,
          }}
        >
          Shared&nbsp;courses
        </Typography>
        <Typography
          sx={{
            color: "#666",
            fontSize: "0.75rem",
            px: 0.5,
          }}
        >
          0
        </Typography>
      </Box>
    </Box>
  );
}

export default CoruseSidebar;
