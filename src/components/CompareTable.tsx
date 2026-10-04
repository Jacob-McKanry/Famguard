import { COMPARE_ROWS, PLANS } from "@/data/plans";
import { CheckIcon } from "./Icons";

// The "Compare plans" table (spec section 7). Rows come from data/plans.ts.
// The Plus column (index 1) gets a green top border and a faint tint.
export default function CompareTable() {
  return (
    <>
      <div className="compare-card">
        <table className="compare-table">
          <caption className="sr-only">Every feature, side by side</caption>
          <thead>
            <tr>
              <th scope="col"><span className="sr-only">Feature</span></th>
              {PLANS.map((plan) => (
                <th key={plan.id} scope="col" className={plan.id === "plus" ? "compare-plus" : undefined}>
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row) => (
              <tr key={row.feature}>
                <th scope="row">{row.feature}</th>
                {row.values.map((value, i) => (
                  <td key={PLANS[i].id} className={PLANS[i].id === "plus" ? "compare-plus" : undefined}>
                    {value === true && (
                      <span className="compare-check">
                        <CheckIcon size={22} />
                        <span className="sr-only">Yes</span>
                      </span>
                    )}
                    {value === false && <span className="compare-no">No</span>}
                    {typeof value === "string" && <span className="compare-text">{value}</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="compare-note">
        Early access: joining is free and you won&apos;t be charged until launch in 2027. Deposits are fully refundable anytime.
      </p>
    </>
  );
}
