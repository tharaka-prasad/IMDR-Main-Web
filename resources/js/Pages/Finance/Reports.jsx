import { Head, router } from '@inertiajs/react';
import { Card, Empty, Field, PageHeader, Stat, TableWrap, TextInput, Thead } from '../../Components/ui';
import { fmtDate, money, useFilters } from '../../lib';

function Bars({ rows, keyName, labelName = keyName, valueName = 'total' }) {
    const max = Math.max(1, ...rows.map((r) => r[valueName]));

    return (
        <ul className="space-y-2">
            {rows.map((r) => (
                <li key={r[labelName]}>
                    <div className="flex justify-between text-sm"><span className="text-navy-700">{r[labelName]}</span><span className="font-semibold">{money(r[valueName])}</span></div>
                    <div className="mt-1 h-2 rounded-full bg-navy-50"><div className="h-2 rounded-full bg-brand" style={{ width: `${(r[valueName] / max) * 100}%` }} /></div>
                </li>
            ))}
        </ul>
    );
}

export default function Reports({ report, outstanding, outstandingTotals, chart }) {
    const [f, setF] = useFilters('/portal/reports', { from: report.from, to: report.to });
    const max = Math.max(1, ...chart.flatMap((d) => [d.income, d.spending]));

    return (
        <>
            <Head title="Reports" />
            <PageHeader title="Financial report" />

            <div className="mb-6 flex flex-wrap items-end gap-3">
                <Field label="From"><TextInput type="date" value={f.from} onChange={(e) => setF({ from: e.target.value }, true)} /></Field>
                <Field label="To"><TextInput type="date" value={f.to} onChange={(e) => setF({ to: e.target.value }, true)} /></Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Income received" value={money(report.income_net)} hint={report.refunds ? `After ${money(report.refunds)} in refunds` : undefined} accent="green" />
                <Stat label="Expenses" value={money(report.expenses)} accent="gold" />
                <Stat label="Payroll paid" value={money(report.payroll)} accent="navy" />
                <Stat label="Net result" value={money(report.net_result)} accent={report.net_result >= 0 ? 'green' : 'red'} />
            </div>

            <Card className="mt-6 p-5">
                <h2 className="mb-4 font-bold text-navy">Income vs spending, last 6 months</h2>
                <div className="flex h-40 items-end gap-3">
                    {chart.map((d) => (
                        <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
                            <div className="flex h-32 w-full items-end justify-center gap-1">
                                <div className="w-1/3 rounded-t bg-brand" style={{ height: `${(d.income / max) * 100}%` }} />
                                <div className="w-1/3 rounded-t bg-gold" style={{ height: `${(d.spending / max) * 100}%` }} />
                            </div>
                            <span className="text-xs text-navy-500">{d.label}</span>
                        </div>
                    ))}
                </div>
            </Card>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Card className="p-5">
                    <h2 className="mb-3 font-bold text-navy">Income by method</h2>
                    {report.by_method.length === 0 ? <p className="text-sm text-navy-500">No payments in this period.</p> : <Bars rows={report.by_method.map((r) => ({ method: r.method, total: r.total }))} keyName="method" labelName="method" />}
                </Card>
                <Card className="p-5">
                    <h2 className="mb-3 font-bold text-navy">Expenses by category</h2>
                    {report.by_category.length === 0 ? <p className="text-sm text-navy-500">No expenses in this period.</p> : <Bars rows={report.by_category} keyName="category" labelName="category" />}
                </Card>
            </div>

            <h2 className="mb-2 mt-8 text-lg font-bold text-navy">Outstanding fees ({money(outstandingTotals.total)} across {outstandingTotals.count} invoices, {money(outstandingTotals.overdue_total)} overdue)</h2>
            {outstanding.length === 0 ? <Empty title="Nothing outstanding" /> : (
                <TableWrap>
                    <Thead><th className="th">Invoice</th><th className="th">Student</th><th className="th">Phone</th><th className="th">Due</th><th className="th text-right">Balance</th></Thead>
                    <tbody className="divide-y divide-navy-50">
                        {outstanding.map((i) => <tr key={i.id} className={i.overdue ? 'bg-red-50/40' : undefined}><td className="td">{i.invoice_no}</td><td className="td">{i.student}<p className="text-xs text-navy-400">{i.student_no}</p></td><td className="td">{i.phone}</td><td className="td">{fmtDate(i.due_date)}</td><td className="td text-right font-semibold">{money(i.balance)}</td></tr>)}
                    </tbody>
                </TableWrap>
            )}
        </>
    );
}
