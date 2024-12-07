import React, { useState, useRef, useCallback, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Container,
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Grid,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PDFDownloadLink, Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import debounce from 'lodash/debounce';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
  },
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  qrCodeContainer: {
    padding: 10,
    backgroundColor: '#ffffff',
  },
  qrCode: {
    width: 200,
    height: 200,
  },
});

const QRCodeGenerator: React.FC = () => {
  const { t } = useTranslation();
  const [qrText, setQrText] = useState('');
  const [description, setDescription] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isPdfReady, setIsPdfReady] = useState(false);
  const qrCodeRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const generateQRCodeUrl = useCallback(() => {
    if (!qrText) {
      setQrCodeUrl('');
      setIsPdfReady(false);
      return;
    }

    // Aguarda o próximo ciclo de renderização para garantir que o canvas foi atualizado
    setTimeout(() => {
      const canvas = qrCodeRef.current;
      if (canvas) {
        try {
          // Cria um novo canvas temporário com fundo branco
          const tempCanvas = document.createElement('canvas');
          const context = tempCanvas.getContext('2d');
          if (!context) return;

          // Define o tamanho do canvas temporário
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;

          // Preenche o fundo com branco
          context.fillStyle = '#FFFFFF';
          context.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

          // Desenha o QR Code original sobre o fundo branco
          context.drawImage(canvas, 0, 0);

          // Converte para URL de dados
          const url = tempCanvas.toDataURL('image/png');
          setQrCodeUrl(url);
          setIsPdfReady(true);
        } catch (error) {
          console.error('Erro ao gerar QR Code URL:', error);
          setIsPdfReady(false);
        }
      }
    }, 100);
  }, [qrText]);

  // Atualiza a URL do QR Code sempre que o texto muda
  useEffect(() => {
    generateQRCodeUrl();
  }, [generateQRCodeUrl]);

  const debouncedSetQrText = useCallback(
    debounce((value: string) => {
      setQrText(value);
    }, 300),
    []
  );

  const handleQrTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    e.target.value = value;
    setIsPdfReady(false);
    debouncedSetQrText(value);
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `qrcode-${description || 'download'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const printQRCode = () => {
    if (!qrCodeUrl) return;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code</title>
            <style>
              body { 
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 20px;
              }
              .container {
                text-align: center;
                background-color: white;
                padding: 20px;
                border-radius: 8px;
              }
              img {
                max-width: 100%;
                height: auto;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>${description || 'QR Code'}</h2>
              <img src="${qrCodeUrl}" alt="QR Code" />
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const QRCodePDF = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          <Text style={styles.title}>{description || 'QR Code'}</Text>
          <View style={styles.qrCodeContainer}>
            <Image src={qrCodeUrl} style={styles.qrCode} />
          </View>
        </View>
      </Page>
    </Document>
  );

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {t('qrcode.title')}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('qrcode.description')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label={t('qrcode.content')}
              defaultValue={qrText}
              onChange={handleQrTextChange}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} ref={containerRef}>
            {qrText && (
              <Box 
                display="flex" 
                justifyContent="center" 
                mb={3}
                sx={{ 
                  backgroundColor: 'white',
                  p: 2,
                  border: '1px solid #ddd',
                  borderRadius: 1
                }}
              >
                <QRCodeCanvas 
                  value={qrText}
                  size={256}
                  level="H"
                  includeMargin={true}
                  ref={qrCodeRef}
                />
              </Box>
            )}
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" gap={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={downloadQRCode}
                disabled={!qrCodeUrl}
              >
                {t('qrcode.downloadPNG')}
              </Button>

              <Button
                variant="contained"
                color="secondary"
                onClick={printQRCode}
                disabled={!qrCodeUrl}
              >
                {t('qrcode.print')}
              </Button>

              {qrText && (
                isPdfReady ? (
                  <PDFDownloadLink
                    document={<QRCodePDF />}
                    fileName={`qrcode-${description || 'download'}.pdf`}
                  >
                    {({ loading }) => (
                      <Button
                        variant="contained"
                        color="success"
                        disabled={loading}
                      >
                        {loading ? t('qrcode.generatingPDF') : t('qrcode.downloadPDF')}
                      </Button>
                    )}
                  </PDFDownloadLink>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    disabled
                  >
                    <CircularProgress size={24} color="inherit" />
                  </Button>
                )
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default QRCodeGenerator;
