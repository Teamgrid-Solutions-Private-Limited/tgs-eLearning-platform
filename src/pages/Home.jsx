import React from "react";
import { Box, Typography, Button, Stack, Grid } from "@mui/material";
import { HiOutlineChevronRight } from "react-icons/hi2";
import { IoAdd } from "react-icons/io5";
import { BsThreeDots } from "react-icons/bs";
import CreateCourseOptions from "../components/CreateCourseOptions";
import GreetingSection from "../components/GreetingSection";
import RecentActivity from "../components/RecentActivity";

// Placeholder data

const templates = [
  {
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    title: "E-Learning Course Review Checklist",
    subtitle:
      "Check the quality of your course before delivering it to learner...",
    tag: "Microlearning",
  },
  {
    image:
      "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=400&q=80",
    title: "E-learning Accessibility Checklist",
    subtitle:
      "Ensure that your e-learning content meets the accessibility guid...",
    tag: "Microlearning",
  },
  {
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80",
    title: "Remote Work Checklist",
    subtitle: "Increase your productivity in the remote setting.",
    tag: "Microlearning",
  },
  {
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    title: "How to create a community in Teams",
    subtitle: "Learn how to create teams and channels in Microsoft Teams.",
    tag: "Microlearning",
  },
  {
    image:
      "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=400&q=80",
    title: "Product Feature Set Checklist",
    subtitle: "Learn how to create your ideal product feature set.",
    tag: "Microlearning",
  },
];

const Home = () => {
  const [showCreateOptions, setShowCreateOptions] = React.useState(false);

  return (
    <Box sx={{ maxWidth: "1400px", mx: "auto", px: 4, py: 4 }}>
      {/* Greeting Section */}
      <GreetingSection />

      {/* Recent Activity */}
      <RecentActivity />

      {/* Popular Templates */}
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Popular templates
          </Typography>
          <Button
            variant="text"
            sx={{
              color: "#222",
              fontWeight: 500,
              textTransform: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              width: "120px",
              gap: 0.5,
            }}
          >
            All templates
            {/* <HiOutlineChevronRight size={18} /> */}
          </Button>
        </Box>
        <Stack direction="row" spacing={3} sx={{ overflowX: "auto", pb: 1 }}>
          {templates.map((tpl, idx) => (
            // <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
            <Box
              sx={{
                bgcolor: "#fff",
                borderRadius: 2,
                boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
                p: 2,
                height: "100%",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px 0 rgba(0,0,0,0.08)",
                },
              }}
            >
              <Box
                sx={{
                  height: 100,
                  mb: 2,
                  borderRadius: 2,
                  overflow: "hidden",
                  background: "#f5f5f5",
                }}
              >
                <img
                  src={tpl.image}
                  alt={tpl.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
              <Box sx={{ mb: 1 }}>
                <Box
                  sx={{
                    bgcolor: "#e3f2fd",
                    color: "#2193b0",
                    fontWeight: 600,
                    fontSize: 12,
                    borderRadius: 1,
                    px: 1,
                    py: 0.2,
                    display: "inline-block",
                    mb: 0.5,
                  }}
                >
                  {tpl.tag}
                </Box>
              </Box>
              <Typography sx={{ fontWeight: 600, fontSize: 15, mb: 0.5 }}>
                {tpl.title}
              </Typography>
              <Typography sx={{ color: "#888", fontSize: 13, mb: 0.5 }}>
                {tpl.subtitle}
              </Typography>
            </Box>
            // </Grid>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default Home;
