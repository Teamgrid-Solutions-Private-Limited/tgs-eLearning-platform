import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CreateCourseOptions from "./CreateCourseOptions";
import CreateCourseDialog from "./CreateCourseDialog";

const GreetingSection = () => {
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
        display: "flex",
        justifyContent: "space-between",
        mb: 5,
        position: "relative",
      }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Hello, Silpi
        </Typography>
        {/* <Box sx={{ }}> */}
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Turn your expertise into engaging courses—quick and easy!
        </Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          onClick={() => setShowCreateOptions(!showCreateOptions)}
          size="small"
          sx={{
            bgcolor: "#43b77a",
            borderRadius: 20,
            px: 3,
            py: 1.2,
            width: "180px",
            height: "40px",
            fontWeight: 600,
            textTransform: "none",
            fontSize: 15,
            boxShadow: "none",
            "&:hover": { bgcolor: "#2e7d32" },
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {/* <Box component="span" sx={{ fontSize: 20 }}>+</Box> */}
          Create course
        </Button>
      </Box>
      {/* </Box> */}

      {/* Create Course Options Popup */}
      {showCreateOptions && (
        <CreateCourseOptions
          onClose={() => setShowCreateOptions(false)}
          topPosition="45px"
          rightPosition={0}
          anchor="right"
          onOptionSelect={(option) => {
            setShowCreateOptions(false);
            if (option === "Start from scratch") {
              setShowCreateDialog(true);
            }
          }}
        />
      )}

      {/* Create Course From Scratch Dialog */}
      <CreateCourseDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreateCourse={handleCreateCourse}
      />
    </Box>
  );
};

export default GreetingSection;
