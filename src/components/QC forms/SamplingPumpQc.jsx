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

const STORAGE_KEY = "sampling-pump-qc-form";

const YesNo = ({ label, value, onChange, required }) => (
  <FormControl fullWidth required={required} sx={{ mt: 1 }}>
    <Typography sx={{ mb: 0.5 }}>{label}</Typography>
    <RadioGroup row value={value || ""} onChange={(e) => onChange(e.target.value)}>
      <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
      <FormControlLabel value="No" control={<Radio />} label="No" />
    </RadioGroup>
  </FormControl>
);

export default function SamplingPumpQc({ onBack }) {
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
        "Pump Type": f.pumpType || "",
        "Application": f.application || "",
        Manufacturer: f.mfg || "",
        Model: f.model || "",
        "Rated Supply Voltage": f.ratedVoltage || "",
        "Rated Current": f.ratedCurrent || "",
        "Rated Flow Range": f.flowRange || "",
        "Maximum Vacuum/Pressure Rating": f.maxPressure || "",
        "Inlet/Outlet Connection Type": f.connectionType || "",
        "Wetted Materials": f.wettedMaterials || "",
        "Is Manufacturer Tag Present?": f.mfgTagPresent || "",
      },

      "C. Visual Inspection": {
        "Pump body free from damage?": f.bodyOk || "",
        "Inlet/outlet ports clean and unobstructed?": f.portsClean || "",
        "Mounting brackets secure?": f.mountSecure || "",
        "Wiring insulation intact?": f.wiringOk || "",
        "Cooling fan/ventilation unobstructed?": f.coolingOk || "",
      },

      "D. Operational Inspection": {
        "Measured Supply Voltage": f.measuredVoltage || "",
        "Measured Current Draw": f.measuredCurrent || "",
        "Flow stable during operation?": f.flowStable || "",
        "Abnormal noise or vibration?": f.noise || "",
        "Leak Test (Pass/Fail)": f.leakTest || "",
        "Overheating observed?": f.overheat || "",
      },

      "E. Final Details": {
        "Assigned Tag": f.tag || "",
        "Is pump OK for use?": f.okForUse || "",
        "Has pump met needed specifications?": f.specsMet || "",
      },
    });

    const doc = await generateQCReport({
      title: "Instrument Quality Inspection Checklist – Sampling Pump",
      sections,
      logoPath: "/logo.png",
      meta: { date: f.date || "" },
    });

    doc.save(`SamplingPump_QC_${f.tag || "report"}.pdf`);
    resetForm();
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBackIosNewIcon />} onClick={onBack}>
          Back to Home
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Sampling Pump QC Form
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
              <InputLabel id="pump-type">1. Pump Type *</InputLabel>
              <Select
                labelId="pump-type"
                label="1. Pump Type *"
                value={f.pumpType || ""}
                onChange={up("pumpType")}
              >
                {["Diaphragm", "Peristaltic", "Rotary Vane", "Other"].map((o) => (
                  <MenuItem key={o} value={o}>{o}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="2. Application (Gas sampling, Vacuum extraction) *"
              value={f.application || ""}
              onChange={up("application")}
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
            <TextField fullWidth label="5. Rated Supply Voltage *" value={f.ratedVoltage || ""} onChange={up("ratedVoltage")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="6. Rated Current *" value={f.ratedCurrent || ""} onChange={up("ratedCurrent")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="7. Rated Flow Range (e.g., 0–5 L/min) *" value={f.flowRange || ""} onChange={up("flowRange")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="8. Maximum Vacuum/Pressure Rating *" value={f.maxPressure || ""} onChange={up("maxPressure")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label='9. Inlet/Outlet Connection Type (e.g., 6mm hose barb, ¼" NPT) *' value={f.connectionType || ""} onChange={up("connectionType")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="10. Wetted Materials (if applicable)" value={f.wettedMaterials || ""} onChange={up("wettedMaterials")} />
          </Grid>

          <Grid item xs={12}>
            <YesNo label="11. Is Manufacturer Tag Present?" value={f.mfgTagPresent} onChange={up("mfgTagPresent")} required />
          </Grid>
        </Grid>
      </Paper>

      {/* C. Visual Inspection */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>C. Visual Inspection</Typography>
        <YesNo label="1. Pump body free from damage?" value={f.bodyOk} onChange={up("bodyOk")} required />
        <YesNo label="2. Inlet/outlet ports clean and unobstructed?" value={f.portsClean} onChange={up("portsClean")} required />
        <YesNo label="3. Mounting brackets secure?" value={f.mountSecure} onChange={up("mountSecure")} required />
        <YesNo label="4. Wiring insulation intact?" value={f.wiringOk} onChange={up("wiringOk")} required />
        <YesNo label="5. Cooling fan/ventilation unobstructed?" value={f.coolingOk} onChange={up("coolingOk")} required />
      </Paper>

      {/* D. Operational Inspection */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>D. Operational Inspection</Typography>

        <TextField fullWidth label="1. Measured Supply Voltage *" value={f.measuredVoltage || ""} onChange={up("measuredVoltage")} required sx={{ mb: 2 }} />
        <TextField fullWidth label="2. Measured Current Draw *" value={f.measuredCurrent || ""} onChange={up("measuredCurrent")} required sx={{ mb: 2 }} />
        <YesNo label="3. Is flow stable during operation?" value={f.flowStable} onChange={up("flowStable")} required />
        <YesNo label="4. Is there abnormal noise or vibration?" value={f.noise} onChange={up("noise")} required />

        <FormControl fullWidth required sx={{ mt: 2 }}>
          <InputLabel id="leak-test">5. Leak Test *</InputLabel>
          <Select
            labelId="leak-test"
            label="5. Leak Test *"
            value={f.leakTest || ""}
            onChange={up("leakTest")}
          >
            <MenuItem value="Pass">Pass</MenuItem>
            <MenuItem value="Fail">Fail</MenuItem>
          </Select>
        </FormControl>

        <YesNo label="6. Overheating observed?" value={f.overheat} onChange={up("overheat")} required />
      </Paper>

      {/* E. Final Details */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>E. Final Details</Typography>

        <TextField fullWidth label="1. Assigned Tag *" value={f.tag || ""} onChange={up("tag")} required sx={{ mb: 2 }} />
        <YesNo label="2. Is pump OK for use?" value={f.okForUse} onChange={up("okForUse")} required />
        <TextField
          fullWidth
          multiline
          minRows={3}
          label="3. Has pump met needed specifications? (Briefly describe flow stability, vacuum performance, electrical behavior, or anomalies) *"
          value={f.specsMet || ""}
          onChange={up("specsMet")}
          required
        />
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