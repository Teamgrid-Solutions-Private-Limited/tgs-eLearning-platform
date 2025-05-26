import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Select,
  MenuItem,
} from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import SettingsIcon from "@mui/icons-material/Settings";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const CourseHeader = ({ title, courseId }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/courses");
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        px: 2,
        py: 1,
        bgcolor: "white",
        borderBottom: "1px solid #e0e0e0",
        zIndex: 5,
      }}
    >
      {/* <Box sx={{ display: "flex" }}> */}
      <Button
        onClick={handleBackClick}
        sx={{
          color: "#666",
          width: "10px",
          paddingRight: 4,
          borderRight: "1px solid #e0e0e0",
        }}
      >
        <KeyboardArrowLeftIcon />
      </Button>
      {/* </Box> */}

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "10%",
          paddingLeft: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            // position: "absolute",
            // left: "50%",
            // transform: "translateX(-50%)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography sx={{ color: "#666", fontSize: "0.8rem" }}>
              Untitled course
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #e0e0e0",
            borderRadius: 1,
            // py: 0.5,
            px: 0.5,
          }}
        >
          <Typography
            sx={{ fontSize: "0.75rem", color: "#666", whiteSpace: "nowrap" }}
          >
            Single-page layout
          </Typography>
          <Button size="small" sx={{ width: 5, color: "black" }}>
            <ArrowDropDownIcon fontSize="small" color="black" />
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 1,
        }}
      >
        <IconButton size="small" sx={{ width: 5 }}>
          <SettingsIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default CourseHeader;
