
// src/components/InstrumentTable.jsx
import * as React from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  MenuItem,
  Select,
  InputLabel,
  Stack,
  Button,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { generateQCReport, makeSections } from "../utils/qcPdf";
const STORAGE_KEYv = "valve-qc-form";


// ---------- helpers ----------
const yesNo = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

function RadioYesNo({ label, value, onChange, required }) {
  return (
    <FormControl required={required} sx={{ width: "100%" }}>
      <FormLabel sx={{ mb: 0.5 }}>{label}</FormLabel>
      <RadioGroup
        row
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        {yesNo.map((o) => (
          <FormControlLabel
            key={o.value}
            value={o.value}
            control={<Radio />}
            label={o.label + (required ? " *" : "")}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}

const sectionTitleSx = {
  fontWeight: 700,
  mb: 1,
};

const headStyle = {
  bgcolor: "transparent",
  color: "text.primary",
  fontWeight: 700,
  letterSpacing: 0.2,
};

// ---------- main component ----------
export default function InstrumentTable({ instrument = "Valve", mode = "qc", onBack }) {
  const isValve = /valve/i.test(instrument);

  // Valve form state
  const [f, setF] = React.useState(() => {
    // try load from localStorage
    try {
      const raw = localStorage.getItem("STORAGE_KEYv");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const set = (k) => (eOrVal) =>
    setF((s) => ({
      ...s,
      [k]: typeof eOrVal === "string" ? eOrVal : eOrVal?.target?.value,
    }));

  const saveLocal = () => {
    localStorage.setItem("STORAGE_KEYv", JSON.stringify(f));
  };
   const resetForm = () => {
  setF({});
  localStorage.removeItem("STORAGE_KEYv");
};

  const saveAndUploadPdf = async() => {
    // persist first
    saveLocal();
    // quick way to let the user export: print to PDF
const sections = makeSections({
    "A. Basic Information": {
      "Inspected by": f.inspector || "",
      "Date of Inspection": f.date || "",
      "Serial Number": f.serial || "",
    },
    "B. Instrument Details": {
      "Valve Type": f.valveType,
      "Valve Size": f.valveSize,
      "Valve Body Materials": f.bodyMaterial,
      "Manufacturer": f.manufacturer,
      "Rated Actuator Supply Voltage": f.supplyV,
      "Connection (Flanged/Threaded)": f.connectionType,
      "Manufacturer Tag Present?": f.tagPresent,
    },
    "C. Visual Inspection": {
      "Wiring Diagram Present?": f.hasWiringDiagram,
      "Manual Override Present?": f.manualOverride,
      "Visual Indicator Present?": f.visualPresent,
      "Valve in Good Condition?": f.goodCondition,
      "Manual Override Opens/Closes?": f.manualOverrideWorks,
      "Limit Switch Feedback Works?": f.limitSwitchOK,
    },
    "D. Operational Inspection": {
      "Measured Actuator Voltage": f.measuredVoltage,
      "Measured Current": f.measuredCurrent,
      "Valve Leak Test (Leakage?)": f.leakTest,
      "Actuation Time (open/close)": f.actuationTime,
    },
    "E. Final Details": {
      "Assigned Tag": f.tag,
      "Is valve OK for use?": f.ok,
      "Has the valve met the needed specifications?": f.specs,
    },
  });

  const doc = await generateQCReport({
    title: "Instrument Quality Inspection Checklist – Valves",
    sections,
    logoPath: "/logo.png",
    meta: { inspector: f.inspector, date: f.date, serial: f.serial },
  });

  doc.save(`Valve_QC_${f.tag || "report"}.pdf`);
  resetForm();


  };

  if (!isValve) {
    return (
      <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
        <Button startIcon={<ArrowBackIosNewIcon />} onClick={onBack} sx={{ mb: 2 }}>
          Back to Home
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          {instrument} — {mode === "qc" ? "Quality Control" : "Calibration"}
        </Typography>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography color="text.secondary">
            The detailed QC form for <b>{instrument}</b> is not configured yet.  
            Tell me the fields and I’ll wire it up like the Valve QC Form.
          </Typography>
        </Paper>
      </Box>
    );
  }

  // ------- Valve QC Form --------
  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBackIosNewIcon />} onClick={onBack}>
          Back to Home
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Valve QC Form
        </Typography>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={headStyle}>
          A. Basic Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="1. Date of Inspection *"
              InputLabelProps={{ shrink: true }}
              value={f.date || ""}
              onChange={set("date")}
              required
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={headStyle}>
          B. Instrument Details
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="1. Valve Type *"
              value={f.valveType || ""}
              onChange={set("valveType")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="valve-size-label">2. Valve Size *</InputLabel>
              <Select
                labelId="valve-size-label"
                label="2. Valve Size *"
                value={f.valveSize || ""}
                onChange={set("valveSize")}
                required
              >
                {[
                  "½\"",
                  "¾\"",
                  "1\"",
                  "1¼\"",
                  "1½\"",
                  "2\"",
                  "2½\"",
                  "3\"",
                  "4\"",
                  "6\"",
                  "8\"",
                  "10\"",
                  "12\"+",
                ].map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="valve-material-label">
                3. Valve Body Materials *
              </InputLabel>
              <Select
                labelId="valve-material-label"
                label="3. Valve Body Materials *"
                value={f.bodyMaterial || ""}
                onChange={set("bodyMaterial")}
                required
              >
                {[
                  "Carbon Steel",
                  "Stainless Steel",
                  "Brass",
                  "PVC/UPVC",
                  "CPVC",
                  "Ductile Iron",
                  "Other",
                ].map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="4. Manufacturer *"
              value={f.manufacturer || ""}
              onChange={set("manufacturer")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="5. Rated Actuator Supply Voltage *"
              placeholder="e.g., 24 VDC / 230 VAC"
              value={f.ratedVoltage || ""}
              onChange={set("ratedVoltage")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="conn-type-label">6. Flanged/Threaded *</InputLabel>
              <Select
                labelId="conn-type-label"
                label="6. Flanged/Threaded *"
                value={f.connectionType || ""}
                onChange={set("connectionType")}
                required
              >
                {["Flanged", "Threaded", "Tri-Clamp", "Welded"].map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <RadioYesNo
              label="7. Is valve tag from manufacturer present?"
              value={f.tagPresent}
              onChange={set("tagPresent")}
              required
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={headStyle}>
          C. Visual Inspection
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <RadioYesNo
              label="1. Is wiring diagram present in the packaging or as a sticker?"
              value={f.wiringDiagram}
              onChange={set("wiringDiagram")}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <RadioYesNo
              label="2. Is manual override mechanism present?"
              value={f.manualOverridePresent}
              onChange={set("manualOverridePresent")}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <RadioYesNo
              label="3. Is there open/close visual indicator?"
              value={f.visualIndicator}
              onChange={set("visualIndicator")}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <RadioYesNo
              label="4. Is the valve in good condition (rust, loose bolts, broken parts, etc.)?"
              value={f.goodCondition}
              onChange={set("goodCondition")}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <RadioYesNo
              label="5. Does manual override open or close the valve?"
              value={f.manualOverrideWorks}
              onChange={set("manualOverrideWorks")}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <RadioYesNo
              label="6. Does limit switch feedback work for both open and close?"
              value={f.limitSwitchFeedback}
              onChange={set("limitSwitchFeedback")}
              required
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={headStyle}>
          D. Operational Inspection
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="1. Measured Actuator Voltage *"
              value={f.measuredVoltage || ""}
              onChange={set("measuredVoltage")}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="2. Measured Current *"
              value={f.measuredCurrent || ""}
              onChange={set("measuredCurrent")}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <RadioYesNo
              label="3. Valve leak test: Is there any leakage present?"
              value={f.leakage}
              onChange={set("leakage")}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="4. Actuation Time (time taken to open/close) *"
              placeholder="e.g., 3.5 s"
              value={f.actuationTime || ""}
              onChange={set("actuationTime")}
              required
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={headStyle}>
          E. Final Details
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="1. Assigned Tag *"
              value={f.assignedTag || ""}
              onChange={set("assignedTag")}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <RadioYesNo
              label="2. Is valve OK for use?"
              value={f.okForUse}
              onChange={set("okForUse")}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="4. Has the valve met the needed specifications? (Briefly describe)"
              value={f.specsSummary || ""}
              onChange={set("specsSummary")}
            />
          </Grid>
        </Grid>
      </Paper>

      <Stack direction="row" spacing={2} sx={{ mb: 6 }}>
        <Button
          variant="contained"
          onClick={saveAndUploadPdf}
        >
          SAVE AND UPLOAD PDF
        </Button>
        <Button variant="outlined" onClick={onBack}>
          BACK TO HOME
        </Button>
      </Stack>
    </Box>
  );
}
