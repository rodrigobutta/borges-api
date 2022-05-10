import { upload } from '../aws/s3';
import { datetimeStamp } from '../../utils/datetime';
import fetch from 'node-fetch';
import imageType from 'image-type';

const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
// const imageType = require('image-type');
// const fetch = require("node-fetch");
// const FileType = require("file-type");
// const S3 = require("./aws/s3");
// const { datetimeStamp } = require("../../utils/datetime");

const fillPDF = async ({
  sourceFileName,
  outputFileName,
  filledTemplate,
  localSourcePath = null,
  saveTo = 'local',
}: {
  sourceFileName: string;
  outputFileName: string;
  filledTemplate: any;
  localSourcePath?: string | null;
  saveTo: string;
}) => {
  try {
    let existingPdfBytes = null;
    if (localSourcePath && localSourcePath !== '') {
      const originPath = localSourcePath || `${path.dirname(require?.main?.filename)}/../public/documents`;
      const filePath = `${originPath}/${sourceFileName}`;
      existingPdfBytes = await fs.readFileSync(filePath, null);
    } else {
      existingPdfBytes = await fetch(sourceFileName).then((res: any) => res.arrayBuffer());
    }

    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pages = pdfDoc.getPages();

    await Promise.all(
      filledTemplate.map(async (d: any) => {
        switch (d.type) {
          case 'text':
            pages[d.page].drawText(String(d.value), {
              x: d.x,
              y: d.y,
              size: d.size,
              font: helveticaFont, // TODO
              color: rgb(d.color[0], d.color[1], d.color[2]),
            });
            break;

          case 'imageAsset':
            if (d.value) {
              const arrayBuffer = fs.readFileSync(d.value);
              const buffer = Buffer.from(arrayBuffer);
              const fileType = await imageType(buffer);
              if (fileType?.ext) {
                const imageData =
                  fileType.ext.toLowerCase() === 'png'
                    ? await pdfDoc.embedPng(arrayBuffer)
                    : await pdfDoc.embedJpg(arrayBuffer);

                const imageDims = imageData.scale(0.35);

                pages[d.page].drawImage(imageData, {
                  x: d.x,
                  y: d.y,
                  width: imageDims.width,
                  height: imageDims.height,
                });
              }
            }
            break;

          case 'imageUrl':
            if (d.value) {
              const response = await fetch(d.value);
              const arrayBuffer = await response.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);

              // const arrayBuffer = fs.readFileSync(d.value);
              const fileType = await imageType(buffer);
              if (fileType?.ext) {
                const imageData =
                  fileType.ext.toLowerCase() === 'png'
                    ? await pdfDoc.embedPng(arrayBuffer)
                    : await pdfDoc.embedJpg(arrayBuffer);

                const imageDims = imageData.scale(0.35);

                pages[d.page].drawImage(imageData, {
                  x: d.x,
                  y: d.y,
                  width: imageDims.width,
                  height: imageDims.height,
                });
              }
            }
            break;

          case 'imageData':
            if (d.value) {
              console.log(d.value);
              const arrayBuffer = d.value.data;
              const buffer = Buffer.from(arrayBuffer);
              const fileType = await imageType(buffer);
              if (fileType?.ext) {
                const imageData =
                  fileType.ext.toLowerCase() === 'png'
                    ? await pdfDoc.embedPng(arrayBuffer)
                    : await pdfDoc.embedJpg(arrayBuffer);

                const imageDims = imageData.scale(0.35);
                console.log('DIMS', imageDims);

                pages[d.page].drawImage(imageData, {
                  x: d.x,
                  y: d.y,
                  width: imageDims.width,
                  height: imageDims.height,
                });
              }
            }
            break;

          default:
            break;
        }
      }),
    );

    if (saveTo === 'local') {
      const pdfData = await pdfDoc.save();
      return savePDFtoAssets(pdfData, outputFileName);
    } else if (saveTo === 'S3') {
      const pdfData = await pdfDoc.saveAsBase64();
      return savePDFtoS3(pdfData, outputFileName);
    } else {
      throw new Error('Saída não especificada');
    }
  } catch (err) {
    throw err;
  }
};

const savePDFtoAssets = async (fileData: any, writeTo: string) => {
  try {
    const outputPath = `${path.dirname(require?.main?.filename)}/../public/documents/signed`;
    const newFilePath = `${outputPath}/${writeTo}`;
    fs.writeFileSync(newFilePath, await fileData);

    const fakePath = `/static/documents/signed/${writeTo}`;
    return fakePath;
  } catch (err) {
    throw err;
  }
};

const savePDFtoS3 = async (fileData: any, writeTo: string) => {
  try {
    var fileContent = Buffer.from(fileData, 'base64');

    const s3Response = await upload(fileContent, writeTo);

    return s3Response.url;
  } catch (err) {
    throw err;
  }
};

const signDocument = async (document: any, data: any, saveTo: string) => {
  const template = [
    {
      page: 0,
      name: 'cpf',
      type: 'text',
      x: 242,
      y: 717,
      size: 11,
      font: 'helveticaFont',
      color: [0, 0, 0],
    },
    {
      page: 0,
      name: 'fullname',
      type: 'text',
      x: 125,
      y: 731,
      size: 11,
      font: 'helveticaFont',
      color: [0, 0, 0],
    },
    {
      page: 1,
      name: 'signDay',
      type: 'text',
      x: 260,
      y: 260,
      size: 11,
      font: 'helveticaFont',
      color: [0, 0, 0],
    },
    {
      page: 1,
      name: 'signMonth',
      type: 'text',
      x: 290,
      y: 260,
      size: 11,
      font: 'helveticaFont',
      color: [0, 0, 0],
    },
    {
      page: 1,
      name: 'signYear',
      type: 'text',
      x: 373,
      y: 260,
      size: 11,
      font: 'helveticaFont',
      color: [0, 0, 0],
    },
    {
      page: 1,
      name: 'fullname',
      type: 'text',
      x: 120,
      y: 205,
      size: 11,
      font: 'helveticaFont',
      color: [0, 0, 0],
    },
    {
      page: 1,
      name: 'cpf',
      type: 'text',
      x: 120,
      y: 190,
      size: 11,
      font: 'helveticaFont',
      color: [0, 0, 0],
    },
    {
      page: 2,
      name: 'signDay',
      type: 'text',
      x: 129,
      y: 165,
      size: 11,
      font: 'helveticaFont',
      color: [0, 0, 0],
    },
    {
      page: 2,
      name: 'signMonth',
      type: 'text',
      x: 155,
      y: 165,
      size: 11,
      font: 'helveticaFont',
      color: [0, 0, 0],
    },
    {
      page: 2,
      name: 'signYear',
      type: 'text',
      x: 234,
      y: 165,
      size: 11,
      font: 'helveticaFont',
      color: [0, 0, 0],
    },
    {
      page: 2,
      name: 'fullname',
      type: 'text',
      x: 180,
      y: 120,
      size: 11,
      font: 'helveticaFont',
      color: [0, 0, 0],
    },
    {
      page: 2,
      name: 'cpf',
      type: 'text',
      x: 180,
      y: 107,
      size: 11,
      font: 'helveticaFont',
      color: [0, 0, 0],
    },
    {
      page: 1,
      name: 'signatureDrawing',
      type: 'imageData',
      x: 90,
      y: 210,
    },
    {
      page: 2,
      name: 'signatureDrawing',
      type: 'imageData',
      x: 310,
      y: 100,
    },
  ];

  const fillData = template.map(tv => {
    const fd = {
      ...tv,
      value: data[tv.name],
    };
    return fd;
  });

  const signedUrl = await fillPDF({
    sourceFileName: document.sourceFile,
    outputFileName: `${document.outputFile}-${data.citizenNumber}-${datetimeStamp()}.pdf`,
    filledTemplate: fillData,
    saveTo,
  });

  return signedUrl;
};

export { signDocument, fillPDF, savePDFtoAssets, savePDFtoS3 };
