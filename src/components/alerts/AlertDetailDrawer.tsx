"use client";

import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import type React from "react";
import {
  type Alert,
  DETECTION_TYPE_DESCRIPTIONS,
  DETECTION_TYPE_LABELS,
  SEVERITY_COLORS,
} from "@/types/alerts";

interface AlertDetailDrawerProps {
  alert: Alert | null;
  open: boolean;
  onClose: () => void;
}

export const AlertDetailDrawer: React.FC<AlertDetailDrawerProps> = ({
  alert,
  open,
  onClose,
}) => {
  if (!alert) return null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: 500,
          p: 3,
          background: "#121212",
          height: "100%",
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Alert Details
          </Typography>
          <CloseIcon sx={{ cursor: "pointer" }} onClick={onClose} />
        </Box>

        <Divider sx={{ mb: 2, borderColor: "#2B2B2B" }} />

        {/* Alert Type and Severity */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: "#B0B0B0", mb: 1 }}>
            Alert Type
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
            {DETECTION_TYPE_LABELS[alert.detection_type]}
          </Typography>
          <Chip
            label={alert.severity.toUpperCase()}
            sx={{
              backgroundColor: SEVERITY_COLORS[alert.severity],
              color: "#000",
              fontWeight: 700,
            }}
          />
        </Box>

        {/* Description */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: "#B0B0B0", mb: 1 }}>
            Description
          </Typography>
          <Typography variant="body2">
            {DETECTION_TYPE_DESCRIPTIONS[alert.detection_type]}
          </Typography>
        </Box>

        <Divider sx={{ my: 2, borderColor: "#2B2B2B" }} />

        {/* Network Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
            Network Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: "#B0B0B0" }}>
                Source IP
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                {alert.source_ip}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: "#B0B0B0" }}>
                Destination IP
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                {alert.destination_ip}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: "#B0B0B0" }}>
                Source Port
              </Typography>
              <Typography variant="body2">{alert.source_port}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: "#B0B0B0" }}>
                Destination Port
              </Typography>
              <Typography variant="body2">{alert.destination_port}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: "#B0B0B0" }}>
                Protocol
              </Typography>
              <Typography variant="body2">{alert.protocol}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2, borderColor: "#2B2B2B" }} />

        {/* Alert Message */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: "#B0B0B0", mb: 1 }}>
            Message
          </Typography>
          <Typography variant="body2" sx={{ fontStyle: "italic" }}>
            {alert.message}
          </Typography>
        </Box>

        {/* Payload Snippet */}
        {alert.payload_snippet && (
          <>
            <Divider sx={{ my: 2, borderColor: "#2B2B2B" }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: "#B0B0B0", mb: 1 }}>
                Payload Snippet
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: "#0A0A0A",
                  border: "1px solid #2B2B2B",
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                  maxHeight: 200,
                  overflow: "auto",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "#FFD600", fontFamily: "monospace" }}
                >
                  {alert.payload_snippet}
                </Typography>
              </Paper>
            </Box>
          </>
        )}

        <Divider sx={{ my: 2, borderColor: "#2B2B2B" }} />

        {/* Timestamps */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: "#B0B0B0", mb: 1 }}>
            Timestamps
          </Typography>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ color: "#B0B0B0", border: "none", p: 1 }}>
                  Event Time:
                </TableCell>
                <TableCell
                  sx={{
                    color: "#E0E0E0",
                    border: "none",
                    p: 1,
                    textAlign: "right",
                  }}
                >
                  {new Date(alert.timestamp).toLocaleString()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ color: "#B0B0B0", border: "none", p: 1 }}>
                  Created:
                </TableCell>
                <TableCell
                  sx={{
                    color: "#E0E0E0",
                    border: "none",
                    p: 1,
                    textAlign: "right",
                  }}
                >
                  {new Date(alert.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ color: "#B0B0B0", border: "none", p: 1 }}>
                  Updated:
                </TableCell>
                <TableCell
                  sx={{
                    color: "#E0E0E0",
                    border: "none",
                    p: 1,
                    textAlign: "right",
                  }}
                >
                  {new Date(alert.updated_at).toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>

        <Divider sx={{ my: 2, borderColor: "#2B2B2B" }} />

        {/* Action Button */}
        <Button
          fullWidth
          variant="contained"
          sx={{
            mt: 2,
            backgroundColor: "#FFD600",
            color: "#000",
            fontWeight: 700,
            "&:hover": {
              backgroundColor: "#F9A825",
            },
          }}
        >
          Acknowledge Alert
        </Button>
      </Box>
    </Drawer>
  );
};
