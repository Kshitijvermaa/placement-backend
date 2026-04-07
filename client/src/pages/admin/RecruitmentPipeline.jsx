import { useEffect, useState, useMemo } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Box, Button,
  TextField, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Alert, Stack, Select, MenuItem,
  FormControl, InputLabel,
} from '@mui/material';
import {
  Timeline as TimelineIcon, Assessment as AssessmentIcon,
  FactCheck, Group as GroupIcon,
} from '@mui/icons-material';
import { adminService } from '../../services';

export default function RecruitmentPipeline() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [statuses, setStatuses] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [results, setResults] = useState([]);
  const [blacklist, setBlacklist] = useState([]);
  const [meta, setMeta] = useState({ offers: [], students: [] });

  const [roundForm, setRoundForm] = useState({ offer_id: '', round_number: '', type: 'technical', scheduled_at: '', duration_minutes: '', max_students: '' });
  const [resultForm, setResultForm] = useState({ application_id: '', round_id: '', result: 'pending', score: '', remarks: '' });
  const [blacklistForm, setBlacklistForm] = useState({ student_id: '', reason: '', expires_at: '' });

  const applicationsForForms = useMemo(
    () => results.map((r) => ({ id: r.application_id, label: `${r.student_name} • ${r.offer_title}` })).filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i),
    [results]
  );

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3500);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sts, rnds, rrs, bl, mt] = await Promise.all([
        adminService.getPlacementStatuses(),
        adminService.getPlacementRounds(),
        adminService.getRoundResults(),
        adminService.getBlacklist(),
        adminService.getExpansionMeta(),
      ]);
      setStatuses(sts);
      setRounds(rnds);
      setResults(rrs);
      setBlacklist(bl);
      setMeta(mt);
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const submit = async (fn, successMessage) => {
    try {
      await fn();
      showMessage('success', successMessage);
      await loadAll();
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Operation failed');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          ⏱️ Recruitment Pipeline
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage rounds, results, statuses, and blacklist
        </Typography>
      </Box>

      {message.text && <Alert severity={message.type} sx={{ mb: 3, borderRadius: 2 }}>{message.text}</Alert>}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.25)', borderRadius: 2, p: 1.5 }}>
                  <TimelineIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h3" fontWeight={800}>{rounds.length}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Rounds</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', color: 'white', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.25)', borderRadius: 2, p: 1.5 }}>
                  <AssessmentIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h3" fontWeight={800}>{results.length}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Results</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.25)', borderRadius: 2, p: 1.5 }}>
                  <FactCheck sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h3" fontWeight={800}>{statuses.length}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Statuses</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', color: 'white', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.25)', borderRadius: 2, p: 1.5 }}>
                  <GroupIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h3" fontWeight={800}>{blacklist.length}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Blacklisted</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">Loading...</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Create Round */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                <Box sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', borderRadius: 1.5, p: 1, display: 'flex' }}>
                  <TimelineIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight={700}>Create Round</Typography>
              </Stack>
              
              <Stack spacing={2} sx={{ mb: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Offer</InputLabel>
                  <Select
                    value={roundForm.offer_id}
                    label="Offer"
                    onChange={(e) => setRoundForm({ ...roundForm, offer_id: e.target.value })}
                  >
                    {meta.offers.map((o) => (
                      <MenuItem key={o.id} value={o.id}>{o.title}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <TextField
                      label="Round #"
                      size="small"
                      type="number"
                      fullWidth
                      value={roundForm.round_number}
                      onChange={(e) => setRoundForm({ ...roundForm, round_number: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={8}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={roundForm.type}
                        label="Type"
                        onChange={(e) => setRoundForm({ ...roundForm, type: e.target.value })}
                      >
                        <MenuItem value="technical">Technical</MenuItem>
                        <MenuItem value="hr">HR</MenuItem>
                        <MenuItem value="aptitude">Aptitude</MenuItem>
                        <MenuItem value="group_discussion">Group Discussion</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <TextField
                      label="Duration (min)"
                      size="small"
                      type="number"
                      fullWidth
                      value={roundForm.duration_minutes}
                      onChange={(e) => setRoundForm({ ...roundForm, duration_minutes: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Max Students"
                      size="small"
                      type="number"
                      fullWidth
                      value={roundForm.max_students}
                      onChange={(e) => setRoundForm({ ...roundForm, max_students: e.target.value })}
                    />
                  </Grid>
                </Grid>
                <TextField
                  label="Scheduled At"
                  size="small"
                  type="datetime-local"
                  fullWidth
                  value={roundForm.scheduled_at}
                  onChange={(e) => setRoundForm({ ...roundForm, scheduled_at: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', textTransform: 'none', fontWeight: 600, py: 1 }}
                  disabled={!roundForm.offer_id || !roundForm.round_number}
                  onClick={() => {
                    submit(() => adminService.createPlacementRound(roundForm), 'Round created');
                    setRoundForm({ offer_id: '', round_number: '', type: 'technical', scheduled_at: '', duration_minutes: '', max_students: '' });
                  }}
                >
                  Create Round
                </Button>
              </Stack>

              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                All Rounds ({rounds.length})
              </Typography>
              <TableContainer sx={{ maxHeight: 300, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 1 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }}>Offer</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }}>Round</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }}>Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rounds.map((r) => (
                      <TableRow key={r.id} hover>
                        <TableCell>{r.offer_title}</TableCell>
                        <TableCell><Chip label={`#${r.round_number}`} size="small" /></TableCell>
                        <TableCell><Chip label={r.type} size="small" color="primary" variant="outlined" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Add Result */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                <Box sx={{ background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', borderRadius: 1.5, p: 1, display: 'flex' }}>
                  <AssessmentIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight={700}>Add Result</Typography>
              </Stack>

              <Stack spacing={2} sx={{ mb: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Application</InputLabel>
                  <Select
                    value={resultForm.application_id}
                    label="Application"
                    onChange={(e) => setResultForm({ ...resultForm, application_id: e.target.value })}
                  >
                    {applicationsForForms.map((a) => (
                      <MenuItem key={a.id} value={a.id}>{a.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Round</InputLabel>
                  <Select
                    value={resultForm.round_id}
                    label="Round"
                    onChange={(e) => setResultForm({ ...resultForm, round_id: e.target.value })}
                  >
                    {rounds.map((r) => (
                      <MenuItem key={r.id} value={r.id}>{r.offer_title} - Round {r.round_number}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Result</InputLabel>
                      <Select
                        value={resultForm.result}
                        label="Result"
                        onChange={(e) => setResultForm({ ...resultForm, result: e.target.value })}
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="selected">Selected</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Score"
                      size="small"
                      type="number"
                      fullWidth
                      value={resultForm.score}
                      onChange={(e) => setResultForm({ ...resultForm, score: e.target.value })}
                    />
                  </Grid>
                </Grid>
                <TextField
                  label="Remarks"
                  size="small"
                  fullWidth
                  multiline
                  rows={2}
                  value={resultForm.remarks}
                  onChange={(e) => setResultForm({ ...resultForm, remarks: e.target.value })}
                />
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', textTransform: 'none', fontWeight: 600, py: 1 }}
                  disabled={!resultForm.application_id || !resultForm.round_id}
                  onClick={() => {
                    submit(() => adminService.createRoundResult(resultForm), 'Result added');
                    setResultForm({ application_id: '', round_id: '', result: 'pending', score: '', remarks: '' });
                  }}
                >
                  Add Result
                </Button>
              </Stack>

              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                Recent Results ({results.length})
              </Typography>
              <TableContainer sx={{ maxHeight: 200, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 1 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }}>Student</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }}>Result</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.slice(0, 10).map((r) => (
                      <TableRow key={r.id} hover>
                        <TableCell>{r.student_name}</TableCell>
                        <TableCell>
                          <Chip
                            label={r.result}
                            size="small"
                            color={r.result === 'selected' ? 'success' : r.result === 'rejected' ? 'error' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Placement Statuses */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                <Box sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', borderRadius: 1.5, p: 1, display: 'flex' }}>
                  <FactCheck sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight={700}>Placement Statuses</Typography>
              </Stack>

              <TableContainer sx={{ maxHeight: 500, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 1 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }}>Student</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }}>Company</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }}>Package</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statuses.map((s) => (
                      <TableRow key={s.id} hover>
                        <TableCell>{s.student_name}</TableCell>
                        <TableCell>
                          <Chip
                            label={s.status}
                            size="small"
                            color={s.status === 'placed' ? 'success' : s.status === 'not_placed' ? 'error' : 'default'}
                          />
                        </TableCell>
                        <TableCell>{s.placed_company || '-'}</TableCell>
                        <TableCell>{s.package_offered || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Blacklist */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                <Box sx={{ background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', borderRadius: 1.5, p: 1, display: 'flex' }}>
                  <GroupIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight={700}>Blacklist</Typography>
              </Stack>

              <Stack spacing={2} sx={{ mb: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Student</InputLabel>
                  <Select
                    value={blacklistForm.student_id}
                    label="Student"
                    onChange={(e) => setBlacklistForm({ ...blacklistForm, student_id: e.target.value })}
                  >
                    {meta.students.map((s) => (
                      <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Reason"
                  size="small"
                  fullWidth
                  multiline
                  rows={2}
                  value={blacklistForm.reason}
                  onChange={(e) => setBlacklistForm({ ...blacklistForm, reason: e.target.value })}
                  placeholder="Reason for blacklisting"
                />
                <TextField
                  label="Expires At"
                  size="small"
                  type="date"
                  fullWidth
                  value={blacklistForm.expires_at}
                  onChange={(e) => setBlacklistForm({ ...blacklistForm, expires_at: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', textTransform: 'none', fontWeight: 600, py: 1 }}
                  disabled={!blacklistForm.student_id || !blacklistForm.reason}
                  onClick={() => {
                    submit(() => adminService.createBlacklist(blacklistForm), 'Student blacklisted');
                    setBlacklistForm({ student_id: '', reason: '', expires_at: '' });
                  }}
                >
                  Add to Blacklist
                </Button>
              </Stack>

              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                Blacklisted ({blacklist.length})
              </Typography>
              <TableContainer sx={{ maxHeight: 250, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 1 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }}>Student</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }}>Reason</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {blacklist.map((b) => (
                      <TableRow key={b.id} hover>
                        <TableCell><Chip label={b.student_name} size="small" color="error" /></TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{b.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
