/** Always-visible notice on every screen: this is a student concept,
 *  not the university's real card system. */
export default function DemoBanner() {
  return (
    <div className="demo-banner" role="note" aria-label="Unofficial demo notice">
      <strong>Unofficial demo.</strong> Not affiliated with HSRW. Don&apos;t use your real password.
    </div>
  );
}
