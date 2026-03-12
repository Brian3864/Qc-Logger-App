import * as React from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Divider,
  Typography,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

export default function SideBarNav({
  mode,          // "qc" | "cal"
  onSetMode,     // (m) => void
  qcItems = [],
  calItems = [],
  onPickQC,      // (item) => void
  onPickCal,     // (item) => void
  width = 280,
}) {
  const [openQC, setOpenQC] = React.useState(mode === "qc");
  const [openCal, setOpenCal] = React.useState(mode === "cal");

  React.useEffect(() => {
    setOpenQC(mode === "qc");
    setOpenCal(mode === "cal");
  }, [mode]);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        "& .MuiDrawer-paper": { width, boxSizing: "border-box", top: 100, height: "calc(100% - 64px)" },
      }}
    >
      <Box sx={{ p: 2 }}>
        
        <Typography sx={{ px: 0, pt: 1.5, pb: 0, fontWeight: 900, fontSize:30, opacity: 1.2 }}>
         Main Section
        </Typography>
      </Box>

      <Divider />

      <List dense>
        {/* QC SECTION */}
        
        <ListItemButton
          onClick={() => {
            const next = !openQC;
            setOpenQC(next);
            if (next) onSetMode("qc");
          }}
        >
          <ListItemText primary="Quality Control" />
          {openQC ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        

        <Collapse in={openQC} timeout="auto" unmountOnExit>
          <List component="div" disablePadding dense>
            {qcItems.map((it) => (
              <ListItemButton
                key={it.key}
                sx={{ pl: 4 }}
                selected={mode === "qc"}
                onClick={() => {
                  onSetMode("qc");
                  onPickQC(it);
                }}
              >
                <ListItemText primary={it.label} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        <Divider sx={{ my: 1 }} />

        {/* CAL SECTION */}
        <ListItemButton
          onClick={() => {
            const next = !openCal;
            setOpenCal(next);
            if (next) onSetMode("cal");
          }}
        >
          <ListItemText primary="Calibration" />
          {openCal ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openCal} timeout="auto" unmountOnExit>
          <List component="div" disablePadding dense>
            {calItems.map((it) => (
              <ListItemButton
                key={it.key}
                sx={{ pl: 4 }}
                selected={mode === "cal"}
                onClick={() => {
                  onSetMode("cal");
                  onPickCal(it);
                }}
              >
                <ListItemText primary={it.label} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      </List>
    </Drawer>
  );
}