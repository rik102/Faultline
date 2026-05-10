import { AlertTriangle, LockKeyhole, ShieldCheck, ShoppingBag } from "lucide-react";

export default function DemoFlow() {
  return (
    <main className="demoFlow">
      <section className="demoHero">
        <div>
          <p className="demoEyebrow">Checkout Review</p>
          <h1>Complete your Faultline Pro trial</h1>
          <p>
            Confirm billing, workspace access, and audit-log settings before your trial
            converts to a team subscription.
          </p>
        </div>
        <div className="trustStack">
          <span>
            <ShieldCheck size={16} />
            SOC 2 ready
          </span>
          <span>
            <LockKeyhole size={16} />
            Encrypted billing
          </span>
        </div>
      </section>

      <section className="checkoutGrid">
        <form className="checkoutPanel">
          <div className="checkoutHeader">
            <ShoppingBag size={20} />
            <div>
              <h2>Plan and billing</h2>
              <p>Some choices become locked after the trial starts.</p>
            </div>
          </div>

          <label>
            Work email
            <input placeholder="name@company.com" />
          </label>
          <label>
            Company size
            <select defaultValue="">
              <option value="" disabled>
                Select a range
              </option>
              <option>1-10</option>
              <option>11-50</option>
              <option>51-250</option>
            </select>
          </label>
          <label>
            Card number
            <input placeholder="4242 4242 4242 4242" />
          </label>

          <div className="choiceRow">
            <button type="button">Start trial</button>
            <button type="button" className="secondaryAction">
              Continue
            </button>
            <button type="button" className="secondaryAction">
              Ask sales
            </button>
          </div>
        </form>

        <aside className="checkoutPanel">
          <div className="checkoutHeader warning">
            <AlertTriangle size={20} />
            <div>
              <h2>Review before confirming</h2>
              <p>Important billing and access details are split across this panel.</p>
            </div>
          </div>
          <dl className="riskList">
            <div>
              <dt>Trial length</dt>
              <dd>14 days, then $249/month unless canceled before renewal.</dd>
            </div>
            <div>
              <dt>Seat access</dt>
              <dd>All invited admins can export reports and add new monitored URLs.</dd>
            </div>
            <div>
              <dt>Refund policy</dt>
              <dd>Refunds are reviewed by support and may require audit-log validation.</dd>
            </div>
          </dl>
          <button type="button" className="fullWidthAction">
            Confirm and activate workspace
          </button>
        </aside>
      </section>
    </main>
  );
}
