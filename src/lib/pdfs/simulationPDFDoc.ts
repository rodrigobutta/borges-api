import { cpf } from 'cpf-cnpj-validator';
import { DateTime } from 'luxon';
import PDFDocument from 'pdfkit';
import { Lead } from '../../models/Lead';
import format from '../../utils/format';
import path from 'path';
import { fullName } from '../../utils/userUtils';

let logofileName = path.join(__dirname, '../../../assets/BorgesHorizontal.jpg');

const TOP_MARGIN = 30;
const LEFT_MARGIN = 20;
const LINE_SPACE = 10.4;
let BASE = TOP_MARGIN;

export default class SimulationPDFDoc {
  doc: any;
  cursor: number;

  constructor() {
    this.cursor = 0;
    this.doc = new PDFDocument({
      size: 'a4',
    });
    this.doc.fontSize(10);
  }

  addLine(text: string, text2: string) {
    this.cursor += 1.5;
    this.doc.font('Helvetica');
    this.doc.fontSize(10);
    this.doc.text(text, LEFT_MARGIN, BASE + LINE_SPACE * this.cursor);
    this.doc.text(text2, LEFT_MARGIN + 250, BASE + LINE_SPACE * this.cursor);
  }

  addTitle(text: string) {
    this.doc.fontSize(10);
    this.cursor += 2;
    this.doc.font('Helvetica-Bold').text(text, LEFT_MARGIN - 10, BASE + LINE_SPACE * this.cursor);
  }
  addHeader(text: string) {
    this.cursor += 2.3;
    this.doc.fontSize(13);
    this.doc.font('Helvetica-Bold').text(text, LEFT_MARGIN + 10, BASE + LINE_SPACE * this.cursor);
    this.cursor += 0.9;
    this.doc
      .strokeColor('#c0c0c0')
      .lineWidth(1)
      .moveTo(20, 90)
      .lineTo(this.doc.page.width - 20, 90)
      .stroke();
    this.cursor += 2;
  }

  addFooter(text: string) {
    this.doc.fontSize(7);
    this.doc.font('Helvetica');
    this.cursor = this.doc.page.height - 50;
    this.doc
      .strokeColor('#c0c0c0')
      .lineWidth(1)
      .moveTo(25, this.doc.page.height - 50)
      .lineTo(133, this.doc.page.height - 50)
      .stroke();
    this.doc.cursor += 1;
    this.doc.text(text, 40, this.doc.page.height - 40, {
      lineBreak: false,
    });
  }

  addLogo(img: any) {
    this.doc.image(img, 5, 5, { height: 50 });
    /* recuadro
    .strokeColor("#c0c0c0")
    .rect(15, 10, 190, 40)
    .stroke() */
  }

  render(data: any, lead: Lead = new Lead()) {
    const valueWithPct = (value: string, pct: string) => {
      // const p = String(Number(pct) * 100);
      return `${format(value, 'currency')}   /   ${format(pct, 'percentage')}`;
    };

    this.addLogo(logofileName);

    this.addHeader('Orçamento de Operação de Crédito Direto ao Consumidor (CDC) - Veículos');

    this.addTitle(`Data do cálculo:  ${format(DateTime.now().toSQLDate(), 'date')}`);
    const texts = [
      ['Cliente:', fullName(lead.customer)],
      ['CPF:', cpf.format(lead.customer.citizenNumber)],
      ['Veículo', 'title'],
      ['Marca:', data.vehicleBrandName],
      ['Modelo:', data.vehicleModelName],
      ['Ano Fabricação / Ano Modelo:', `${data.assemblyYear} / ${data.year}`],
      ['Cor:', data.color],
      ['1. Valor do Veículo:', data.vehicleValue, 'currency'],
      ['2. Valor da entrada:', data.downPayment, 'currency'],
      ['3. Valor entregue:', valueWithPct(data.netAmount, data.netAmountPct)],
      ['Tarifas', 'title'],
      ['4. Tarifa de Cadastro', valueWithPct(data.tacFee, data.tacFeePct)],
      ['Despesas vinculadas à concessão do crédito', 'title'],
      ['5.1. Registro do Contrato:', valueWithPct(data.stateGravamen, data.stateGravamenPct)],
      ['5.2. Seguro Proteção Financeira', 0, 'currency'],
      ['6. IOF financiado - Alíquota 3,00% a.a. + \n 0,38% única(se houver):', valueWithPct(data.iof, data.iofPct)],
      [' '],
      ['7. Valor total financiado (3+4+5+6):', valueWithPct(data.totalFinancedValue, '1')],
      ['8. Valor total da dívida:', data.debt, 'currency'],
      ['Parcelas', 'title'],
      ['9. Valor de cada parcela:', data.monthlyPayment, 'currency'],
      ['10. Quantidade de parcelas:', data.parcelas],
      ['11. Data de vencimento da 1a parcela:', data.firstPaymentDueDate, 'date'],
      ['', 'title'],
      [
        '12. Taxa de Juros:',
        `${format(String(data.monthlyRate), 'percentage')} mês  /  ${format(
          String(data.annualRate),
          'percentage',
        )} ano`,
      ],
      [
        '13. Custo Efetivo Total (CET):',
        `${format(String(data.monthlyCET), 'percentage')} mês  /  ${format(String(data.annualCET), 'percentage')} ano`,
      ],
    ];

    texts.map(x => {
      if (x.length > 1) {
        if (x[1] === 'title') {
          return this.addTitle(x[0]);
        }
        return this.addLine(x[0], format(x[1], x[2]));
      }
      return this.addLine(x[0], '');
    });

    this.addFooter('Crédito sujeito à aprovação no momento da contratação');

    return this.doc;
  }
}

exports.SimulationPDFDoc = SimulationPDFDoc;
