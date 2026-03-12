
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
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { generateQCReport, makeSections } from "../../utils/qcPdf";

const STORAGE_KEY = "gas-cooler-qc-form";

const YesNo = ({ label, value, onChange, required }) => (
  <FormControl fullWidth required={required} sx={{ mt: 1 }}>
    <Typography sx={{ mb: 0.5 }}>{label}</Typography>
    <RadioGroup row value={value || ""} onChange={(e) => onChange(e.target.value)}>
      <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
      <FormControlLabel value="No" control={<Radio />} label="No" />
    </RadioGroup>
  </FormControl>
);

export default function GasCoolerQc({ onBack }) {
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

  // Application checkbox handling
  const toggleApp = (key) => (e) => {
    const checked = e.target.checked;
    setF((s) => ({
      ...s,
      application: { ...(s.application || {}), [key]: checked },
    }));
  };

  const saveAndPdf = async () => {
    saveLocal();

    const applicationText = [
      f?.application?.processCooling ? "Process cooling" : null,
      f?.application?.sampleGas ? "Sample gas conditioning & drying" : null,
    ]
      .filter(Boolean)
      .join(", ");

    const sections = makeSections({
      "A. Basic Information": {
        "Date of Inspection": f.date || "",
        Application: applicationText || "",
      },

      "B. Equipment Details": {
        "Gas Being Conditioned": f.gasBeingConditioned || "",
        "Intended Function": f.intendedFunction || "",
        "Cooler Type": f.coolerType || "",
        "Cooling Medium": f.coolingMedium || "",
        Manufacturer: f.manufacturer || "",
        Model: f.model || "",
        "Serial Number": f.serialNumber || "",
        "Design Gas Inlet Temperature": f.designInletTemp || "",
        "Target Gas Outlet Temperature": f.targetOutletTemp || "",
        "Gas Connection Type": f.gasConnectionType || "",
        "Heat exchange Body Material": f.bodyMaterial || "",
        "Is Manufacturer Tag Present?": f.mfgTagPresent || "",
      },

      "C. Visual Inspection": {
        "Unit free from physical damage?": f.noPhysicalDamage || "",
        "Gas ports clean and properly sealed?": f.gasPortsClean || "",
        "Condensate drain port present and accessible?": f.drainPortPresent || "",
        "Condensate collection path clear (no blockage)?": f.pathClear || "",
        "Mounting brackets secure?": f.mountingSecure || "",
        "Nameplate legible?": f.nameplateLegible || "",
      },

      "D. Operational Inspection – Cooling & Moisture Removal": {
        "1) Temperature Performance": "",
        "Gas Inlet Temperature (Measured)": f.measInletTemp || "",
        "Gas Outlet Temperature (Measured)": f.measOutletTemp || "",
        "Ambient Temperature (Measured)": f.measAmbientTemp || "",
        "Temperature Drop Achieved (ΔT)": f.deltaT || "",
        "Outlet temperature meets target specification?": f.meetsTargetTemp || "",

        "2) Moisture Condensation Performance": "",
        "Visible condensate produced during operation?": f.visibleCondensate || "",
        "Condensate draining properly?": f.condensateDraining || "",
        "Measured Gas Inlet Relative Humidity (%)": f.inletRH || "",
        "Measured Gas Outlet Relative Humidity (%)": f.outletRH || "",
        "Outlet Dew Point (°C) (Calculated/Measured)": f.outletDewPoint || "",
        "Outlet gas non-condensable at ambient conditions?": f.nonCondensableAmbient || "",
        "Outlet gas shows visible condensation when exposed to ambient air?":
          f.condensationInAmbientAir || "",
        "Silica gel/beads – time to first moisture signs": f.silicaFirstSigns || "",
        "Silica gel/beads – time to saturation": f.silicaSaturation || "",
      },

      "E. Electrical Inspection": {
        "Rated Supply Voltage": f.ratedSupplyV || "",
        "Measured Supply Voltage": f.measuredSupplyV || "",
        "Measured Current": f.measuredCurrent || "",
        "Cooling module operating correctly?": f.coolingModuleOk || "",
        "Fans operational (if applicable)?": f.fansOk || "",
      },

      "F. Final Details": {
        "Assigned Tag": f.assignedTag || "",
        "Gas Cooler OK for Use?": f.okForUse || "",
        "Has Gas Cooler Met Conditioning & Drying Specifications?": f.specsMet || "",
        "Inspector Name & Signature": f.inspectorSignature || "",
      },
    });

    const doc = await generateQCReport({
      title: "Instrument Quality Inspection Checklist – Gas Cooler",
      sections,
      logoPath: "/logo.png",
      meta: { inspector: f.inspectorSignature || "", date: f.date || "", serial: f.serialNumber || "" },
    });

    doc.save(`GasCooler_QC_${f.assignedTag || "report"}.pdf`);
    resetForm();
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBackIosNewIcon />} onClick={onBack}>
          Back to Home
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Gas Cooler QC Form
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

          <Grid item xs={12} md={6}>
            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>2. Application *</Typography>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!f?.application?.processCooling}
                    onChange={toggleApp("processCooling")}
                  />
                }
                label="Process cooling"
              />
              <FormControlLabel
                control={
                  <Checkbox checked={!!f?.application?.sampleGas} onChange={toggleApp("sampleGas")} />
                }
                label="Sample gas conditioning & drying"
              />
            </FormGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* B. Equipment Details */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>B. Equipment Details</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="1. Gas Being Conditioned *"
              value={f.gasBeingConditioned || ""}
              onChange={up("gasBeingConditioned")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="2. Intended Function *"
              value={f.intendedFunction || ""}
              onChange={up("intendedFunction")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel id="cooler-type">3. Cooler Type *</InputLabel>
              <Select
                labelId="cooler-type"
                label="3. Cooler Type *"
                value={f.coolerType || ""}
                onChange={up("coolerType")}
              >
                {["Peltier", "Air-cooled", "Water-cooled", "Shell & Tube", "Other"].map((o) => (
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
              label="4. Cooling Medium (if applicable)"
              value={f.coolingMedium || ""}
              onChange={up("coolingMedium")}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="5. Manufacturer *" value={f.manufacturer || ""} onChange={up("manufacturer")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="6. Model *" value={f.model || ""} onChange={up("model")} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="7. Serial Number *"
              value={f.serialNumber || ""}
              onChange={up("serialNumber")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="8. Design Gas Inlet Temperature *"
              value={f.designInletTemp || ""}
              onChange={up("designInletTemp")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="9. Target Gas Outlet Temperature *"
              value={f.targetOutletTemp || ""}
              onChange={up("targetOutletTemp")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={`10. Gas Connection Type (e.g., 6mm tube, ¼" NPT) *`}
              value={f.gasConnectionType || ""}
              onChange={up("gasConnectionType")}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="11. Heat exchange Body Material *"
              value={f.bodyMaterial || ""}
              onChange={up("bodyMaterial")}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <YesNo
              label="12. Is Manufacturer Tag Present?"
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
            <YesNo label="1. Is the unit free from physical damage?" value={f.noPhysicalDamage} onChange={up("noPhysicalDamage")} required />
          </Grid>
          <Grid item xs={12}>
            <YesNo label="2. Are gas ports clean and properly sealed?" value={f.gasPortsClean} onChange={up("gasPortsClean")} required />
          </Grid>
          <Grid item xs={12}>
            <YesNo label="3. Is condensate drain port present and accessible?" value={f.drainPortPresent} onChange={up("drainPortPresent")} required />
          </Grid>
          <Grid item xs={12}>
            <YesNo label="4. Is condensate collection path clear (no blockage)?" value={f.pathClear} onChange={up("pathClear")} required />
          </Grid>
          <Grid item xs={12}>
            <YesNo label="5. Are mounting brackets secure?" value={f.mountingSecure} onChange={up("mountingSecure")} required />
          </Grid>
          <Grid item xs={12}>
            <YesNo label="6. Is nameplate legible?" value={f.nameplateLegible} onChange={up("nameplateLegible")} required />
          </Grid>
        </Grid>
      </Paper>

      {/* D. Operational Inspection */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>
          D. Operational Inspection – Cooling & Moisture Removal
        </Typography>

        <Typography sx={{ fontWeight: 700, mt: 1 }}>1. Temperature Performance</Typography>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="1. Gas Inlet Temperature (Measured) *" value={f.measInletTemp || ""} onChange={up("measInletTemp")} required />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="2. Gas Outlet Temperature (Measured) *" value={f.measOutletTemp || ""} onChange={up("measOutletTemp")} required />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="3. Ambient Temperature (Measured) *" value={f.measAmbientTemp || ""} onChange={up("measAmbientTemp")} required />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="4. Temperature Drop Achieved (ΔT) *" value={f.deltaT || ""} onChange={up("deltaT")} required />
          </Grid>
          <Grid item xs={12}>
            <YesNo label="5. Does outlet temperature meet target specification?" value={f.meetsTargetTemp} onChange={up("meetsTargetTemp")} required />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography sx={{ fontWeight: 700, mt: 1 }}>2. Moisture Condensation Performance</Typography>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <YesNo label="1. Is visible condensate produced during operation?" value={f.visibleCondensate} onChange={up("visibleCondensate")} required />
          </Grid>
          <Grid item xs={12}>
            <YesNo label="2. Is condensate draining properly?" value={f.condensateDraining} onChange={up("condensateDraining")} required />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="3. Measured Gas Inlet Relative Humidity (%) *" value={f.inletRH || ""} onChange={up("inletRH")} required />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="4. Measured Gas Outlet Relative Humidity (%) *" value={f.outletRH || ""} onChange={up("outletRH")} required />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="5. Outlet Dew Point (°C) (Calculated/Measured) *" value={f.outletDewPoint || ""} onChange={up("outletDewPoint")} required />
          </Grid>
          <Grid item xs={12}>
            <YesNo
              label="6. Is outlet gas non-condensable at ambient conditions? (dew point below ambient temperature)"
              value={f.nonCondensableAmbient}
              onChange={up("nonCondensableAmbient")}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <YesNo
              label="7. When exposed to ambient air, does outlet gas show visible condensation?"
              value={f.condensationInAmbientAir}
              onChange={up("condensationInAmbientAir")}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="8a. Silica gel/beads – time to first moisture signs *" value={f.silicaFirstSigns || ""} onChange={up("silicaFirstSigns")} required />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="8b. Silica gel/beads – time to saturation *" value={f.silicaSaturation || ""} onChange={up("silicaSaturation")} required />
          </Grid>
        </Grid>
      </Paper>

      {/* E. Electrical Inspection */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>E. Electrical Inspection</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="1. Rated Supply Voltage *" value={f.ratedSupplyV || ""} onChange={up("ratedSupplyV")} required />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="2. Measured Supply Voltage *" value={f.measuredSupplyV || ""} onChange={up("measuredSupplyV")} required />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="3. Measured Current *" value={f.measuredCurrent || ""} onChange={up("measuredCurrent")} required />
          </Grid>

          <Grid item xs={12}>
            <YesNo label="4. Is cooling module operating correctly?" value={f.coolingModuleOk} onChange={up("coolingModuleOk")} required />
          </Grid>
          <Grid item xs={12}>
            <YesNo label="5. Are fans operational (if applicable)?" value={f.fansOk} onChange={up("fansOk")} required />
          </Grid>
        </Grid>
      </Paper>

      {/* F. Final Details */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>F. Final Details</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="1. Assigned Tag *" value={f.assignedTag || ""} onChange={up("assignedTag")} required />
          </Grid>

          <Grid item xs={12}>
            <YesNo label="2. Is Gas Cooler OK for Use?" value={f.okForUse} onChange={up("okForUse")} required />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="3. Has the Gas Cooler Met Conditioning & Drying Specifications? (Briefly describe outlet temp, dew point, condensation behavior, silica gel suitability) *"
              value={f.specsMet || ""}
              onChange={up("specsMet")}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="4. Inspector Name & Signature *"
              value={f.inspectorSignature || ""}
              onChange={up("inspectorSignature")}
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