// src/components/QC forms/DifferentialPressureTransmitterQc.jsx
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

const STORAGE_KEY = "dp-tx-qc-form";

const YesNo = ({ label, value, onChange, required }) => (
  <FormControl fullWidth required={required} sx={{ mt: 1 }}>
    <Typography sx={{ mb: 0.5 }}>{label}</Typography>
    <RadioGroup row value={value || ""} onChange={(e) => onChange(e.target.value)}>
      <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
      <FormControlLabel value="No" control={<Radio />} label="No" />
    </RadioGroup>
  </FormControl>
);

export default function DifferentialPressureTransmitterQc({ onBack }) {
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
        "Sensor Type": f.sensorType || "",
        Manufacturer: f.mfg || "",
        Model: f.model || "",
        "Measurement Range": f.range || "",
        "High-Pressure (HP) Port Connection Type": f.hpConn || "",
        "Low-Pressure (LP) Port Connection Type": f.lpConn || "",
        "Measured Supply Voltage": f.supplyV || "",
        "Output Signal": f.outputSig || "",
        "Is Manufacturer Tag Present?": f.mfgTagPresent || "",
      },

      "C. Visual Inspection": {
        "Are HP and LP ports clearly marked?": f.portsMarked || "",
        "Are ports free from damage or blockage?": f.portsClear || "",
        "Is enclosure free from cracks/corrosion/loose covers?": f.enclosureOk || "",
        "Is Visual Indicator Present?": f.visualPresent || "",
        "Is Visual Indicator Working?": f.visualWorking || "",
        "Are cable glands properly secured?": f.cableGlandsOk || "",
      },

      "D. Operational Inspection": {
        "Installation Method": f.installMethod || "",
        "Zero Check (HP = LP) – Output Reading": f.zeroOutput || "",
        "Zero within tolerance?": f.zeroWithinTol || "",
        "Applied Known Differential Pressure": f.appliedDP || "",
        "Transmitter Output at Applied Pressure": f.outputAtApplied || "",
        "Deviation from Expected Output": f.deviation || "",
        "Is response stable (no drift/fluctuation)?": f.responseStable || "",
        "Enclosure Material": f.enclosureMat || "",
        "Transmitter Dimensions": f.txDims || "",
        "Cable Termination": f.cableTerm || "",
      },

      "E. Final Details": {
        "Assigned Tag": f.tag || "",
        "Is device OK for use?": f.okForUse || "",
        "Has the device met the needed specifications?": f.specsMet || "",
      },
    });

    const doc = await generateQCReport({
      title: "Instrument Quality Inspection Checklist – Differential Pressure Transmitter",
      sections,
      logoPath: "/logo.png",
      meta: { date: f.date || "" },
    });

    doc.save(`DP_Transmitter_QC_${f.tag || "report"}.pdf`);
    resetForm();
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBackIosNewIcon />} onClick={onBack}>
          Back to Home
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Differential Pressure Transmitter QC Form
        </Typography>
      </Stack>

      {/* A. Basic Information */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>A. Basic Information</Typography>
        <TextField
          fullWidth
          type="date"
          label="1. Date of Inspection *"
          InputLabelProps={{ shrink: true }}
          value={f.date || ""}
          onChange={up("date")}
          required
        />
      </Paper>

      {/* B. Instrument Details */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>B. Instrument Details</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel id="sensor-type">1. Sensor Type *</InputLabel>
              <Select
                labelId="sensor-type"
                label="1. Sensor Type *"
                value={f.sensorType || ""}
                onChange={up("sensorType")}
              >
                {["Capacitive", "Piezoresistive", "Strain Gauge", "Other"].map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="2. Manufacturer *" value={f.mfg || ""} onChange={up("mfg")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="3. Model *" value={f.model || ""} onChange={up("model")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="4. Measurement Range (e.g., 0–1000 Pa, 0–10 kPa) *"
              value={f.range || ""}
              onChange={up("range")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="5. High-Pressure (HP) Port Connection Type *"
              value={f.hpConn || ""}
              onChange={up("hpConn")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="6. Low-Pressure (LP) Port Connection Type *"
              value={f.lpConn || ""}
              onChange={up("lpConn")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="7. Measured Supply Voltage *"
              value={f.supplyV || ""}
              onChange={up("supplyV")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel id="output-sig">8. Output Signal *</InputLabel>
              <Select
                labelId="output-sig"
                label="8. Output Signal *"
                value={f.outputSig || ""}
                onChange={up("outputSig")}
              >
                {["4–20 mA", "0–10 V", "Modbus/RS485", "HART", "Other"].map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <YesNo
              label="9. Is Manufacturer Tag Present?"
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
        <YesNo label="1. Are HP and LP ports clearly marked?" value={f.portsMarked} onChange={up("portsMarked")} required />
        <YesNo label="2. Are ports free from damage or blockage?" value={f.portsClear} onChange={up("portsClear")} required />
        <YesNo
          label="3. Is enclosure free from cracks, corrosion, or loose covers?"
          value={f.enclosureOk}
          onChange={up("enclosureOk")}
          required
        />
        <YesNo label="4. Is Visual Indicator Present?" value={f.visualPresent} onChange={up("visualPresent")} required />
        <YesNo label="5. Is Visual Indicator Working?" value={f.visualWorking} onChange={up("visualWorking")} required />
        <YesNo label="6. Are cable glands properly secured?" value={f.cableGlandsOk} onChange={up("cableGlandsOk")} required />
      </Paper>

      {/* D. Operational Inspection */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>D. Operational Inspection</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="1. Installation Method (e.g., Wall mounted, Duct mounted) *"
              value={f.installMethod || ""}
              onChange={up("installMethod")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="2. Zero Check (HP = LP) – Output Reading *"
              value={f.zeroOutput || ""}
              onChange={up("zeroOutput")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <YesNo label="3. Zero within tolerance?" value={f.zeroWithinTol} onChange={up("zeroWithinTol")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="4. Applied Known Differential Pressure *"
              value={f.appliedDP || ""}
              onChange={up("appliedDP")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="5. Transmitter Output at Applied Pressure *"
              value={f.outputAtApplied || ""}
              onChange={up("outputAtApplied")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="6. Deviation from Expected Output *"
              value={f.deviation || ""}
              onChange={up("deviation")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <YesNo
              label="7. Is response stable (no drift/fluctuation)?"
              value={f.responseStable}
              onChange={up("responseStable")}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField fullWidth label="8. Enclosure Material *" value={f.enclosureMat || ""} onChange={up("enclosureMat")} required />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="9. Transmitter Dimensions *"
              value={f.txDims || ""}
              onChange={up("txDims")}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="10. Cable Termination *"
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
            <TextField
              fullWidth
              label="1. Assigned Tag (e.g., DPT-0001) *"
              value={f.tag || ""}
              onChange={up("tag")}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <YesNo label="2. Is device OK for use?" value={f.okForUse} onChange={up("okForUse")} required />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="3. Has the device met the needed specifications? (Briefly describe zero stability, scaling accuracy, response behavior, anomalies) *"
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