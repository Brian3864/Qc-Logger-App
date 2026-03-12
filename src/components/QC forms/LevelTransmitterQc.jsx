
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

const STORAGE_KEY = "level-transmitter-qc-form";

const YesNo = ({ label, value, onChange, required }) => (
  <FormControl fullWidth required={required} sx={{ mt: 1 }}>
    <Typography sx={{ mb: 0.5 }}>{label}</Typography>
    <RadioGroup row value={value || ""} onChange={(e) => onChange(e.target.value)}>
      <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
      <FormControlLabel value="No" control={<Radio />} label="No" />
    </RadioGroup>
  </FormControl>
);

export default function LevelTransmitterQc({ onBack }) {
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
        "Level Measurement Technology": f.tech || "",
        "Measured Medium": f.medium || "",
        Manufacturer: f.mfg || "",
        Model: f.model || "",
        "Measurement Range": f.range || "",
        "Process Connection": f.processConn || "",
        "Wetted Parts Material": f.wettedMaterial || "",
        "Measured Supply Voltage": f.supplyV || "",
        "Output Signal": f.outputSig || "",
        "Is Manufacturer Tag Present?": f.mfgTagPresent || "",
      },

      "C. Visual Inspection": {
        "Probe/antenna/diaphragm free from physical damage?": f.damageFree || "",
        "Enclosure in good condition (no cracks, corrosion, loose covers)?": f.enclosureGood || "",
        "Visual Indicator Present?": f.visualPresent || "",
        "Visual Indicator Working?": f.visualWorking || "",
        "Cable glands properly tightened and sealed?": f.glandsOk || "",
      },

      "D. Operational Inspection": {
        "Installation Method": f.installMethod || "",
        "Tank/Process Height": f.tankHeight || "",
        "Measured Level Reading (Actual Displayed Value)": f.measuredLevel || "",
        "Verified Level (Manual/Reference Measurement)": f.verifiedLevel || "",
        "Deviation from Reference": f.deviation || "",
        "Output signal within calibrated range (4mA at LRV, 20mA at URV)?":
          f.withinCalRange || "",
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
      title: "Instrument Quality Inspection Checklist – Level Transmitter",
      sections,
      logoPath: "/logo.png",
      meta: { inspector: f.inspector || "", date: f.date || "", serial: f.serial || "" },
    });

    doc.save(`LevelTransmitter_QC_${f.tag || "report"}.pdf`);
    resetForm();
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBackIosNewIcon />} onClick={onBack}>
          Back to Home
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Level Transmitter QC Form
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
              <InputLabel id="tech">1. Level Measurement Technology *</InputLabel>
              <Select
                labelId="tech"
                label="1. Level Measurement Technology *"
                value={f.tech || ""}
                onChange={up("tech")}
              >
                {[
                  "Radar",
                  "Ultrasonic",
                  "Hydrostatic",
                  "Magnetostrictive",
                  "Capacitive",
                  "Other",
                ].map((o) => (
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
              label="2. Measured Medium (e.g., Water, Condensate, Chemical) *"
              value={f.medium || ""}
              onChange={up("medium")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="3. Manufacturer *" value={f.mfg || ""} onChange={up("mfg")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="4. Model *" value={f.model || ""} onChange={up("model")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="5. Measurement Range (e.g., 0–3m) *"
              value={f.range || ""}
              onChange={up("range")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='6. Process Connection (e.g., 1" NPT, DN50 Flange) *'
              value={f.processConn || ""}
              onChange={up("processConn")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="7. Wetted Parts Material (e.g., SS316) *"
              value={f.wettedMaterial || ""}
              onChange={up("wettedMaterial")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="8. Measured Supply Voltage *"
              value={f.supplyV || ""}
              onChange={up("supplyV")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel id="output-sig">9. Output Signal *</InputLabel>
              <Select
                labelId="output-sig"
                label="9. Output Signal *"
                value={f.outputSig || ""}
                onChange={up("outputSig")}
              >
                {["4–20 mA", "0–10 V", "Modbus RS485", "HART", "Other"].map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <YesNo
              label="10. Is Manufacturer Tag Present?"
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
              label="1. Is probe/antenna/diaphragm free from physical damage?"
              value={f.damageFree}
              onChange={up("damageFree")}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <YesNo
              label="2. Is enclosure in good condition (no cracks, corrosion, loose covers)?"
              value={f.enclosureGood}
              onChange={up("enclosureGood")}
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
              label="5. Are cable glands properly tightened and sealed?"
              value={f.glandsOk}
              onChange={up("glandsOk")}
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
              label="1. Installation Method (e.g., Top mounted, Side mounted) *"
              value={f.installMethod || ""}
              onChange={up("installMethod")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="2. Tank/Process Height *"
              value={f.tankHeight || ""}
              onChange={up("tankHeight")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="3. Measured Level Reading (Actual Displayed Value) *"
              value={f.measuredLevel || ""}
              onChange={up("measuredLevel")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="4. Verified Level (Manual/Reference Measurement) *"
              value={f.verifiedLevel || ""}
              onChange={up("verifiedLevel")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="5. Deviation from Reference *"
              value={f.deviation || ""}
              onChange={up("deviation")}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <YesNo
              label="6. Is output signal within calibrated range (4mA at LRV, 20mA at URV)?"
              value={f.withinCalRange}
              onChange={up("withinCalRange")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="7. Enclosure Material *"
              value={f.enclosureMat || ""}
              onChange={up("enclosureMat")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="8. Transmitter Dimensions *"
              value={f.txDims || ""}
              onChange={up("txDims")}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="9. Cable Termination (e.g., Terminal block, M12 connector) *"
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
              label="3. Has the device met the needed specifications? (Briefly describe calibration accuracy, deviation, stability, or anomalies) *"
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