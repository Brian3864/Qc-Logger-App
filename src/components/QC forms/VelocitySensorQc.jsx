
import * as React from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Stack,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { generateQCReport, makeSections } from "../../utils/qcPdf";

const STORAGE_KEY = "velocity-sensor-qc-form";

const YesNo = ({ label, value, onChange, required }) => (
  <FormControl fullWidth required={required} sx={{ mt: 1 }}>
    <Typography sx={{ mb: 0.5 }}>{label}</Typography>
    <RadioGroup row value={value || ""} onChange={(e) => onChange(e.target.value)}>
      <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
      <FormControlLabel value="No" control={<Radio />} label="No" />
    </RadioGroup>
  </FormControl>
);

export default function VelocitySensorQc({ onBack }) {
  const [f, setF] = React.useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const up = (k) => (eOrVal) =>
    setF((s) => ({
      ...s,
      [k]: typeof eOrVal === "string" ? eOrVal : eOrVal?.target?.value,
    }));

  const saveLocal = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(f));

  const resetForm = () => {
    setF({});
    localStorage.removeItem(STORAGE_KEY);
  };

  const saveAndPdf = async () => {
    saveLocal();

    const sections = makeSections({
      "A. Basic Information": {
        "Date of Inspection": f.date || "",
      },

      "B. Instrument Details": {
        "Measurement Type (Air velocity, Gas velocity, Airflow rate)": f.measureType || "",
        "Technology Type (Hot-wire, Thermal Mass, Vane, Pitot Tube, etc.)": f.techType || "",
        "Measured Medium (Ambient air, Process air, CO₂ stream, etc.)": f.medium || "",
        Manufacturer: f.mfg || "",
        Model: f.model || "",
        "Measurement Range (e.g., 0–20 m/s)": f.range || "",
        "Duct/Pipe Size (if applicable)": f.pipeSize || "",
        "Probe Length (if insertion type)": f.probeLength || "",
        "Measured Supply Voltage": f.supplyV || "",
        "Output Signal (4–20 mA, 0–10 V, RS485, etc.)": f.outputSig || "",
        "Is Manufacturer Tag Present?": f.mfgTagPresent || "",
      },

      "C. Visual Inspection": {
        "Is sensing element free from damage or contamination?": f.sensingClean || "",
        "Is probe straight and mechanically secure?": f.probeSecure || "",
        "Is Visual Indicator Present?": f.visualPresent || "",
        "Is Visual Indicator Working?": f.visualWorking || "",
        "Are cable terminations secure?": f.cableSecure || "",
        "Is enclosure in good condition?": f.enclosureGood || "",
      },

      "D. Operational Inspection": {
        "Installation Method (Duct mounted, In-line, Handheld)": f.installMethod || "",
        "Measured Velocity Reading": f.measuredVelocity || "",
        "Reference Velocity Reading (if calibrated against standard)": f.referenceVelocity || "",
        "Deviation from Reference": f.deviation || "",
        "Does instrument respond to airflow change?": f.respondsAirflow || "",
        "Zero Reading Check (No Flow Condition)": f.zeroCheck || "",
        "Output Signal Verification (4–20mA / Voltage scaling) Pass/Fail": f.outputVerify || "",
        "Enclosure Material": f.enclosureMat || "",
        "Transmitter Dimensions": f.txDims || "",
        "Cable Termination Type": f.cableTerm || "",
      },

      "E. Final Details": {
        "Assigned Tag": f.tag || "",
        "Is device OK for use?": f.okForUse || "",
        "Has the device met the needed specifications?": f.specsMet || "",
      },
    });

    const doc = await generateQCReport({
      title: "Instrument Quality Inspection Checklist – Velocity Sensor / Anemometer",
      sections,
      logoPath: "/logo.png",
      meta: { date: f.date || "" },
    });

    doc.save(`VelocitySensor_QC_${f.tag || "report"}.pdf`);
    resetForm();
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBackIosNewIcon />} onClick={onBack}>
          Back to Home
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Velocity Sensor QC Form
        </Typography>
      </Stack>

      {/* A. Basic Information */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>A. Basic Information</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="1. Date of Inspection *"
              InputLabelProps={{ shrink: true }}
              value={f.date || ""}
              onChange={up("date")}
              required
            />
          </Grid>
        </Grid>
      </Paper>

      {/* B. Instrument Details */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>B. Instrument Details</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel id="measure-type">1. Measurement Type *</InputLabel>
              <Select
                labelId="measure-type"
                label="1. Measurement Type *"
                value={f.measureType || ""}
                onChange={up("measureType")}
              >
                {["Air velocity", "Gas velocity", "Airflow rate", "Other"].map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel id="tech-type">2. Technology Type *</InputLabel>
              <Select
                labelId="tech-type"
                label="2. Technology Type *"
                value={f.techType || ""}
                onChange={up("techType")}
              >
                {["Hot-wire", "Thermal Mass", "Vane", "Pitot Tube", "Ultrasonic", "Other"].map(
                  (o) => (
                    <MenuItem key={o} value={o}>
                      {o}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="3. Measured Medium (e.g., Ambient air, Process air, CO₂ stream) *"
              value={f.medium || ""}
              onChange={up("medium")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="4. Manufacturer *" value={f.mfg || ""} onChange={up("mfg")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="5. Model *" value={f.model || ""} onChange={up("model")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="6. Measurement Range (e.g., 0–20 m/s) *"
              value={f.range || ""}
              onChange={up("range")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="7. Duct/Pipe Size (if applicable)"
              value={f.pipeSize || ""}
              onChange={up("pipeSize")}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="8. Probe Length (if insertion type)"
              value={f.probeLength || ""}
              onChange={up("probeLength")}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="9. Measured Supply Voltage *"
              value={f.supplyV || ""}
              onChange={up("supplyV")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel id="output-sig">10. Output Signal *</InputLabel>
              <Select
                labelId="output-sig"
                label="10. Output Signal *"
                value={f.outputSig || ""}
                onChange={up("outputSig")}
              >
                {["4–20 mA", "0–10 V", "RS485/Modbus", "HART", "Pulse", "Other"].map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <YesNo
              label="11. Is Manufacturer Tag Present?"
              value={f.mfgTagPresent}
              onChange={up("mfgTagPresent")}
              required
            />
          </Grid>
        </Grid>
      </Paper>

      {/* C. Visual Inspection */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>C. Visual Inspection</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <YesNo
              label="1. Is sensing element free from damage or contamination?"
              value={f.sensingClean}
              onChange={up("sensingClean")}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <YesNo
              label="2. Is probe straight and mechanically secure?"
              value={f.probeSecure}
              onChange={up("probeSecure")}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <YesNo
              label="3. Is Visual Indicator Present?"
              value={f.visualPresent}
              onChange={up("visualPresent")}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <YesNo
              label="4. Is Visual Indicator Working?"
              value={f.visualWorking}
              onChange={up("visualWorking")}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <YesNo
              label="5. Are cable terminations secure?"
              value={f.cableSecure}
              onChange={up("cableSecure")}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <YesNo
              label="6. Is enclosure in good condition?"
              value={f.enclosureGood}
              onChange={up("enclosureGood")}
              required
            />
          </Grid>
        </Grid>
      </Paper>

      {/* D. Operational Inspection */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>D. Operational Inspection</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="1. Installation Method (e.g., Duct mounted, In-line, Handheld) *"
              value={f.installMethod || ""}
              onChange={up("installMethod")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="2. Measured Velocity Reading *"
              value={f.measuredVelocity || ""}
              onChange={up("measuredVelocity")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="3. Reference Velocity Reading (if calibrated against standard)"
              value={f.referenceVelocity || ""}
              onChange={up("referenceVelocity")}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="4. Deviation from Reference"
              value={f.deviation || ""}
              onChange={up("deviation")}
            />
          </Grid>

          <Grid item xs={12}>
            <YesNo
              label="5. Does instrument respond to airflow change?"
              value={f.respondsAirflow}
              onChange={up("respondsAirflow")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="6. Zero Reading Check (No Flow Condition)"
              value={f.zeroCheck || ""}
              onChange={up("zeroCheck")}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel id="output-verify">
                7. Output Signal Verification (Pass/Fail) *
              </InputLabel>
              <Select
                labelId="output-verify"
                label="7. Output Signal Verification (Pass/Fail) *"
                value={f.outputVerify || ""}
                onChange={up("outputVerify")}
              >
                {["Pass", "Fail"].map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="8. Enclosure Material *"
              value={f.enclosureMat || ""}
              onChange={up("enclosureMat")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="9. Transmitter Dimensions *"
              value={f.txDims || ""}
              onChange={up("txDims")}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="10. Cable Termination Type *"
              value={f.cableTerm || ""}
              onChange={up("cableTerm")}
              required
            />
          </Grid>
        </Grid>
      </Paper>

      {/* E. Final Details */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>E. Final Details</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="1. Assigned Tag *" value={f.tag || ""} onChange={up("tag")} required />
          </Grid>

          <Grid item xs={12}>
            <YesNo label="2. Is device OK for use?" value={f.okForUse} onChange={up("okForUse")} required />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="3. Has the device met the needed specifications? (Briefly describe calibration results, stability, repeatability, or anomalies) *"
              value={f.specsMet || ""}
              onChange={up("specsMet")}
              required
            />
          </Grid>
        </Grid>
      </Paper>

      <Stack direction="row" spacing={2} sx={{ mb: 6 }}>
        <Button variant="contained" onClick={saveAndPdf}>
          SAVE AND UPLOAD PDF
        </Button>
        <Button variant="outlined" onClick={onBack}>
          BACK TO HOME
        </Button>
      </Stack>
    </Box>
  );
}