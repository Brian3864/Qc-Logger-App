
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { generateQCReport, makeSections } from "../utils/qcPdf";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
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
  const instrumentName =
    typeof instrument === "string"
      ? instrument
      : typeof instrument?.name === "string"
      ? instrument.name
      : typeof instrument?.label === "string"
      ? instrument.label
      : "Valve";

  const isValve = /valve/i.test(instrumentName);

  console.log("instrument prop =", instrument);
  console.log("instrumentName =", instrumentName);

  // Valve form state
  const [f, setF] = React.useState(() => {
    // try load from localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEYv);
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
    localStorage.setItem(STORAGE_KEYv, JSON.stringify(f));
  };
   const resetForm = () => {
  setF({});
  localStorage.removeItem(STORAGE_KEYv);
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
      "Leakage Test – Pressure Decay": {
      "Initial Pressure (bar)": numericLeakRows[0]?.pressure ?? "",
      "Final Pressure (bar)": numericLeakRows[numericLeakRows.length - 1]?.pressure ?? "",
      "Total Test Time (s)": numericLeakRows[numericLeakRows.length - 1]?.time ?? "",
      "Calculated Leakage Rate (bar/s)": leakageRate || "",
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

  const defaultLeakRows = Array.from({ length: 11 }, (_, i) => ({
  time: i,
  pressure: "",
}));

const [leakRows, setLeakRows] = React.useState(() => {
  try {
    const raw = localStorage.getItem("valve-leak-rows");
    return raw ? JSON.parse(raw) : defaultLeakRows;
  } catch {
    return defaultLeakRows;
  }
});

React.useEffect(() => {
  localStorage.setItem("valve-leak-rows", JSON.stringify(leakRows));
}, [leakRows]);

const updateLeakPressure = (index, value) => {
  setLeakRows((rows) =>
    rows.map((r, i) =>
      i === index ? { ...r, pressure: value } : r
    )
  );
};

const numericLeakRows = leakRows
  .map((r) => ({
    time: Number(r.time),
    pressure: r.pressure === "" ? null : Number(r.pressure),
  }))
  .filter((r) => r.pressure !== null && !Number.isNaN(r.pressure));

const leakageRate =
  numericLeakRows.length >= 2
    ? (
        (numericLeakRows[0].pressure -
          numericLeakRows[numericLeakRows.length - 1].pressure) /
        ((numericLeakRows[numericLeakRows.length - 1].time -
          numericLeakRows[0].time) || 1)
      ).toFixed(4)
    : "";

const chartData = leakRows
  .map((row) => ({
    time: Number(row.time),
    pressure: row.pressure === "" ? null : Number(row.pressure),
  }))
  .filter(
    (row) =>
      Number.isFinite(row.time) &&
      row.pressure !== null &&
      Number.isFinite(row.pressure)
  );

const chartWidth = 700;
const chartHeight = 320;
const padding = 70;

// const minTime = chartData.length > 0 ? Math.min(...chartData.map((p) => p.time)) : 0;
// const maxTime = chartData.length > 0 ? Math.max(...chartData.map((p) => p.time)) : 10;

// const minPressure =
//   chartData.length > 0 ? Math.min(...chartData.map((p) => p.pressure)) : 0;
// const maxPressure =
//   chartData.length > 0 ? Math.max(...chartData.map((p) => p.pressure)) : 1000;

const minTime = 0;
const maxTime = 10;

const minPressure = 3500;
const maxPressure = 4500;

const safeMaxTime = maxTime === minTime ? minTime + 1 : maxTime;
const safeMaxPressure = maxPressure === minPressure ? minPressure + 1 : maxPressure;

const chartPoints = chartData
  .map((point) => {
    const x =
      padding +
      ((point.time - minTime) / (safeMaxTime - minTime)) * (chartWidth - 2 * padding);

    const y =
      chartHeight -
      padding -
      ((point.pressure - minPressure) / (safeMaxPressure - minPressure)) *
        (chartHeight - 2 * padding);

    return `${x},${y}`;
  })
  .join(" ");

  if (!isValve) {
    return (
      <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
        <Button startIcon={<ArrowBackIosNewIcon />} onClick={onBack} sx={{ mb: 2 }}>
          Back to Home
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          {instrumentName} — {mode === "qc" ? "Quality Control" : "Calibration"}
        </Typography>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography color="text.secondary">
            The detailed QC form for <b>{instrumentName}</b> is not configured yet.  
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
   <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
  <Typography variant="subtitle1" sx={headStyle}>
    Leakage Test – Pressure Decay
  </Typography>

  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
    Enter pressure readings against time to determine leakage rate.
  </Typography>

  <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 700 }}>Time (s)</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Pressure reading (bar)</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {leakRows.map((row, index) => (
          <TableRow key={index}>
            <TableCell>{row.time}</TableCell>
            <TableCell>
              <TextField
                fullWidth
                size="small"
                type="number"
                inputProps={{ step: "0.001" }}
                value={row.pressure ?? ""}
                onChange={(e) =>
               updateLeakPressure(index, e.target.value === "" ? "" : Number(e.target.value))
              }
                // onChange={(e) => updateLeakPressure(index, e.target.value)}
                placeholder="Enter pressure"
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>

  <Grid container spacing={2} sx={{ mb: 2 }}>
    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        label="Calculated Leakage Rate (millibar/s)"
        value={leakageRate}
        InputProps={{ readOnly: true }}
      />
    </Grid>
  </Grid>
<Box sx={{ width: "100%", mt: 2, overflowX: "auto" }}>
  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
    Pressure Decay Graph
  </Typography>

  {chartData.length > 0 ? (
    <svg width={chartWidth} height={chartHeight} style={{ border: "1px solid #ccc", background: "#fff" }}>

      {[3500, 3750, 4000, 4250, 4500].map((p) => {
  const y =
    chartHeight -
    padding -
    ((p - minPressure) / (maxPressure - minPressure)) *
      (chartHeight - 2 * padding);

  return (
    <text key={p} x={25} y={y + 4} fontSize="10">
      {p}
    </text>
  );
})}

{[0, 2, 4, 6, 8, 10].map((t) => {
  const x =
    padding +
    ((t - minTime) / (maxTime - minTime)) *
      (chartWidth - 2 * padding);

  return (
    <text key={t} x={x} y={chartHeight - 45} fontSize="10" textAnchor="middle">
      {t}
    </text>
  );
})}
      <line
        x1={padding}
        y1={chartHeight - padding}
        x2={chartWidth - padding}
        y2={chartHeight - padding}
        stroke="black"
      />
      <line
        x1={padding}
        y1={padding}
        x2={padding}
        y2={chartHeight - padding}
        stroke="black"
      />

      <text x={chartWidth / 2} y={chartHeight - 5} textAnchor="middle" fontSize="12">
        Time (s)
      </text>
      <text
        x={25}
        y={chartHeight / 2}
        textAnchor="middle"
        fontSize="12"
        transform={`rotate(-90 15 ${chartHeight / 2})`}
      >
        Pressure (mbar)
      </text>

      <polyline
        fill="none"
        stroke="#1976d2"
        strokeWidth="2"
        points={chartPoints}
      />

      {chartData.map((point, index) => {
        const cx =
          padding +
          ((point.time - minTime) / (safeMaxTime - minTime)) * (chartWidth - 2 * padding);

        const cy =
          chartHeight -
          padding -
          ((point.pressure - minPressure) / (safeMaxPressure - minPressure)) *
            (chartHeight - 2 * padding);

        return <circle key={index} cx={cx} cy={cy} r={3} fill="#1976d2" />;
      })}
    </svg>
  ) : (
    <Typography variant="body2" color="text.secondary">
      Enter pressure readings to display the graph.
    </Typography>
  )}
</Box>
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
