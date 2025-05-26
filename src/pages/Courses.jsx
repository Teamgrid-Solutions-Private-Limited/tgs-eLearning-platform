import React from "react";
import { Box, Typography, Button, IconButton, InputBase } from "@mui/material";
import { IoSearchOutline, IoEllipsisHorizontal, IoArrowForwardOutline } from "react-icons/io5";
import { MdOutlineLocalOffer } from "react-icons/md";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { BsFolder2 } from "react-icons/bs";
import { IoAddOutline } from "react-icons/io5";
import CoruseSidebar from "../components/CoruseSidebar";

const courses = [
  {
    id: 1,
    title: "New course",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80",
    date: "May 25, 2025",
    tags: ["Add tag"],
  },
  {
    id: 2,
    title: "E-Learning Course Review Checklist",
    image:
      "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=400&q=80",
    date: "May 25, 2025",
    tags: ["checklist", "resource"],
  },
  {
    id: 3,
    title: "Untitled course",
    image:
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=400&q=80",
    date: "May 25, 2025",
    tags: ["Add tag"],
  },
  {
    id: 4,
    title: "How to troubleshoot software",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    date: "May 25, 2025",
    tags: ["how-to", "resource"],
  },
  {
    id: 5,
    title: "Backend Node Js",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80",
    date: "May 25, 2025",
    tags: ["Add tag"],
  },
];

const Courses = () => {
  return (
    <Box sx={{ display: "flex", minHeight: "calc(100vh - 73px)" }}>
      {/* Left Sidebar */}
      <CoruseSidebar />

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 4 }}>
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 4,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                justifyContent: "flex-start",
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, color: "#2C2C2C" }}
              >
                My courses
              </Typography>

              {/* Search Bar */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  // bgcolor: '#fff',
                  borderRadius: "8px",
                  // border: '1px solid #e0e0e0',
                  // px: 2,
                  py: 1,
                }}
              >
                <IoSearchOutline size={20} color="#666" />
                <InputBase
                  placeholder="Search"
                  sx={{ ml: 1, flex: 1, fontSize: "0.875rem" }}
                />
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                justifyContent: "flex-end",
              }}
            >
              {/* Tags Button */}
              <Button
                startIcon={<MdOutlineLocalOffer size={18} />}
                variant="outlined"
                sx={{
                  color: "#666",
                  borderColor: "#e0e0e0",
                  textTransform: "none",
                  width: 100,
                  borderRadius: "20px",
                  px: 2,
                  "&:hover": { borderColor: "#bdbdbd" },
                }}
              >
                Tags
              </Button>

              {/* Groups Button */}
              <Button
                startIcon={<HiOutlineUserGroup size={18} />}
                variant="outlined"
                sx={{
                  color: "#666",
                  borderColor: "#e0e0e0",
                  textTransform: "none",
                  width: 100,
                  borderRadius: "20px",
                  px: 2,
                  "&:hover": { borderColor: "#bdbdbd" },
                }}
              >
                Groups
              </Button>
            </Box>
          </Box>

          {/* Course List */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {courses.map((course) => (
              <Box
                key={course.id}
                sx={{
                  bgcolor: "#fff",
                  borderRadius: "8px",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  p: 2,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                  },
                }}
              >
                {/* Course Image */}
                <Box
                  sx={{
                    width: 220,
                    height: 100,
                    borderRadius: "8px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <img
                    src={course.image}
                    alt={course.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <Box sx={{
                    width: 120,
                    height: 100,
                    // bgcolor: "rgba(255,255,255,0.9)",
                    px: 0.2,
                    borderRadius: "4px",
                    position: "absolute",
                    top: 0,
                    // right: 10,
                    left: 0,
                  }}>
                  <Typography 
                    sx={{ 
                      color: "#666", 
                      fontSize: "0.65rem", 
                      position: "absolute", 
                      bottom: 8, 
                      left: 8,
                      bgcolor: "rgba(255,255,255,0.9)",
                      px: 0.5,
                      py: 0.1,
                      borderRadius: "4px"
                    }}
                  >
                    Modified: {course.date}
                  </Typography>
                  </Box>
                </Box>

                {/* Course Info */}
                <Box
                  sx={{ display: "flex", flexDirection: "column", minWidth: 0, gap: 1 }}
                >
                  {/* <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    mb: 1,
                  }}> */}
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      color: "#2C2C2C",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {course.title}
                  </Typography>

                  {/* </Box> */}

                  {/* <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}> */}
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {course.tags.map((tag, index) => (
                      <Button
                        key={index}
                        // startIcon={<MdOutlineLocalOffer size={12} />}
                        size="small"
                        sx={{
                          textTransform: "none",
                          color: "#666",
                          // bgcolor: "#f5f5f5",
                          borderRadius: "12px",
                          border: "1px solid #e0e0e0",
                          px: 0.5,
                          py: 0.2,
                          fontSize: "0.75rem",
                          width: 80,
                          "&:hover": { bgcolor: "#eeeeee", border: "1px solid #bdbdbd" },
                        }}
                      >
                        {tag}
                      </Button>
                    ))}
                  </Box>
                  {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}> */}

                  <Button
                    sx={{
                      color: "#666",
                      textTransform: "none",
                      fontSize: "0.70rem",
                      width: 70,
                      p: 0,
                      "&:hover": {
                        bgcolor: "transparent",
                        textDecoration: "underline",
                      },
                    }}
                  >
                    More details
                  </Button>
                  {/* </Box> */}
                </Box>
                <Button
                  size="small"
                  sx={{
                    color: "#666",
                    p: 0.5,
                    ml: 2,
                    width: 30,
                    height: 30,
                    "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                  }}
                >
                  <IoEllipsisHorizontal size={20} />
                </Button>
              </Box>
              // </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Courses;
