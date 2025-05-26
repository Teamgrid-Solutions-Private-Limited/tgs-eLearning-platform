import React, { useEffect, useRef } from "react";
import { Box, Typography, Paper, List, ListItem } from "@mui/material";
import { LuFileText } from "react-icons/lu";
import { BsGrid } from "react-icons/bs";
import { LuFileInput } from "react-icons/lu";
import { LuFileUp } from "react-icons/lu";

const options = [
  {
    icon: <LuFileText size={20} />,
    title: "Start from scratch",
    description: "Create your course the way you want, step by step",
  },
  {
    icon: <BsGrid size={18} />,
    title: "Use a template",
    description:
      "Pick any template and customize it to suit your e-learning needs",
  },
  {
    icon: <LuFileInput size={20} />,
    title: "Import Scorm Package",
    description: "Create a course from a SCORM package",
  },
  {
    icon: <LuFileUp size={20} />,
    title: "Import PowerPoint",
    description: "Convert your presentations into e-learning courses",
  },
];

const CreateCourseOptions = ({
  onClose,
  topPosition = "50px",
  rightPosition = 0,
  anchor = "right",
  onOptionSelect,
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleOptionClick = (option) => {
    if (onOptionSelect) {
      onOptionSelect(option.title);
    }
  };

  return (
    <Paper
      ref={modalRef}
      elevation={3}
      sx={{
        position: "absolute",
        top: topPosition,
        ...(anchor === "right"
          ? { right: rightPosition }
          : { left: rightPosition }),
        width: "360px",
        borderRadius: "16px",
        overflow: "hidden",
        zIndex: 1300,
        bgcolor: "#fff",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      }}
    >
      <List sx={{ p: 2 }}>
        {options.map((option, index) => (
          <ListItem
            key={index}
            sx={{
              px: 2,
              py: 1.5,
              cursor: "pointer",
              borderRadius: "12px",
              "&:hover": {
                bgcolor: "rgba(67, 183, 122, 0.06)",
              },
              display: "flex",
              gap: 2.5,
              alignItems: "flex-start",
              mb: index !== options.length - 1 ? 0.5 : 0,
            }}
            onClick={() => handleOptionClick(option)}
          >
            <Box
              sx={{
                color: "#43b77a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                width: 24,
                height: 24,
              }}
            >
              {option.icon}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: "0.9375rem",
                    color: "#2C2C2C",
                    lineHeight: 1.2,
                  }}
                >
                  {option.title}
                </Typography>
                {option.badge && (
                  <Box
                    sx={{
                      bgcolor: "#43b77a",
                      color: "white",
                      px: 1.5,
                      py: 0.25,
                      height: "22px",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      ml: 1,
                    }}
                  >
                    {option.badge}
                  </Box>
                )}
              </Box>
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  color: "#666666",
                  lineHeight: 1.4,
                }}
              >
                {option.description}
              </Typography>
            </Box>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default CreateCourseOptions;
