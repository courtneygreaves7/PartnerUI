/**
 * Plain-English explanations for partner-facing measurement cards.
 * Keep outcome-led where possible. Avoid em-dashes.
 */

export const METRIC_HELP: Record<string, string> = {
  "Attachment (average)":
    "Share of bookings where a guest chose Flexible Cancellation or Damage Deposit Waiver.",
  Attachment:
    "Share of bookings where a guest chose Flexible Cancellation or Damage Deposit Waiver.",
  "Margin (ex. VAT) £m":
    "Partner margin earned from attached products, excluding VAT.",
  "Margin (ex. VAT)":
    "Partner margin earned from attached products, excluding VAT.",
  "Inc cancellations & relets":
    "Extra partner revenue from cancelled stays that were rebooked through Flexible Cancellation.",
  "Website conversion*":
    "Estimated extra partner revenue from higher website conversion when products are offered.",
  "Website conversion":
    "Estimated extra partner revenue from higher website conversion when products are offered.",
  Total: "Total partner revenue from Pikl'd Stays in the selected period.",
  "Gross bookings":
    "Total partner booking volume in the period. This is the base for availability and attachment. It is not incremental bookings from Flexible Cancellation.",
  "Average lead time":
    "Average days between booking and arrival for Flexible Cancellation bookings, shown against bookings without it. A profile difference, not proven incremental demand.",
  "Average length of stay":
    "Average nights per stay for Flexible Cancellation bookings, shown against bookings without it. A profile difference, not proven incremental demand.",
  "Avg spend per booking":
    "Average guest spend for Flexible Cancellation bookings, shown against bookings without it. A profile difference, not proven incremental demand.",
  "Average Pikl'd Stay IPB":
    "Average partner income per booking with Pikl'd Stays products, shown against bookings without Flexible Cancellation. A profile difference, not proven incremental demand.",
  "Pikl Index Score":
    "Composite score of how your portfolio compares with market averages across key measures. 100 is market average.",
  "Offer Conversion":
    "Share of product-available bookings that went on to attach a Pikl product.",
  "Avg Lead Time":
    "Average days between booking and stay for Flexible Cancellation bookings.",
  "Partner Revenue":
    "Total partner revenue from Pikl'd Stays in the selected period.",
  "Offer Rate":
    "How often products are available on bookings, and how often they attach when offered.",

  // Pikl Market metrics
  "Cancellation rate":
    "Share of partner bookings that cancel, compared with the market average.",
  "Attachment rate":
    "Share of bookings where a guest chose Flexible Cancellation or Damage Deposit Waiver, compared with the market.",
  "Relet rate":
    "Share of cancelled stays that were successfully relet, compared with the market.",
  "Rebookability rate":
    "Share of cancelled stays that are successfully rebooked, compared with the market.",
  "Rebookability average value":
    "Average value recovered when a cancelled stay is rebooked, compared with the market.",

  // Chart / summary cards
  "Revenue Drivers":
    "How total partner revenue splits across margin, website conversion uplift, and incremental cancellations and relets.",
  "Gross bookings trend":
    "Monthly booking volume over time, so you can see seasonality and growth.",
  "Partner vs Market":
    "Your portfolio versus market averages on key booking and stay measures. Blue is partner. Grey is market.",

  // Insights top summary
  "Total bookings": "All partner bookings in the selected period across brands and channels.",
  "Bookings offered a product":
    "Share of bookings where Flexible Cancellation or Damage Deposit Waiver was available to the guest.",
  "Bookings offered product":
    "Number of bookings where a Pikl product was offered to the guest.",
  "Total margin earned": "Partner margin earned from Pikl'd Stays products in the period.",
  "Income per booking": "Average partner income from Pikl'd Stays per booking.",

  // Flexible Cancellation rate cards
  "FC guest price avg":
    "Average share of booking value charged to the guest for Flexible Cancellation.",
  "Insurance premium rate avg":
    "Average product rate applied across attached bookings.",
  "Out of test conversion":
    "Conversion lift from the product outside test cohorts.",
  "Conversion benefit":
    "Estimated partner margin from conversion uplift on the product.",

  // Damage Deposit Waiver rate cards
  "DDL guest price avg":
    "Average waiver price charged to the guest for Damage Deposit Waiver.",

  // Insights volume / commercial panels
  "FC Bookings by channel":
    "Flexible Cancellation bookings split by website, app, offline, and OTA.",
  "Attachment & margin":
    "How often Flexible Cancellation attaches, and the partner margin it generates by channel.",
  "DDL Bookings by channel":
    "Damage Deposit Waiver bookings split by website, app, offline, and OTA.",
  "DDL Attachment & margin":
    "How often Damage Deposit Waiver attaches, and the partner margin it generates by channel.",
  "FC Attachment":
    "Share of eligible bookings that attached Flexible Cancellation.",
  "FC Partner Margin":
    "Partner margin earned from Flexible Cancellation by channel.",
  "DDL Attachment":
    "Share of eligible bookings that attached Damage Deposit Waiver.",
  "DDL Partner Margin":
    "Partner margin earned from Damage Deposit Waiver by channel.",
}

export function getMetricHelp(label: string): string {
  return (
    METRIC_HELP[label] ??
    `What this measures: ${label}. Ask your Pikl contact if you need a fuller definition.`
  )
}

/**
 * Hover copy for green/red change chips next to a metric value.
 * Explains the movement, not the metric itself.
 */
export const TREND_HELP: Record<string, string> = {
  "Gross bookings":
    "Change in total booking volume versus the prior period. Not a Flexible Cancellation incremental impact.",
  "Average lead time":
    "Difference versus bookings without Flexible Cancellation. Profile comparison, not proven cause.",
  "Average length of stay":
    "Difference versus bookings without Flexible Cancellation. Profile comparison, not proven cause.",
  "Avg spend per booking":
    "Difference versus bookings without Flexible Cancellation. Profile comparison, not proven cause.",
  "Average Pikl'd Stay IPB":
    "Difference versus bookings without Flexible Cancellation. Profile comparison, not proven cause.",
  "Gross bookings trend":
    "Change in total booking volume versus the prior period. Volume context, not incremental product impact.",
  "Cancellation rate":
    "Change in cancellation rate versus the prior period. A fall is usually better for retained revenue.",
  "Attachment rate":
    "Change in attachment rate versus the prior period, in percentage points.",
  "Relet rate":
    "Change in relet rate versus the prior period, in percentage points.",
  "Rebookability rate":
    "Change in the share of cancelled stays that were rebooked, versus the prior period.",
  "Rebookability average value":
    "Change in average value recovered when a cancelled stay is rebooked, versus the prior period.",
  "Total bookings":
    "Change in total bookings versus the prior period.",
  "Bookings offered a product":
    "Change in the share of bookings offered a product, in percentage points versus the prior period.",
  "Bookings offered product":
    "Change in the number of bookings offered a product, versus the prior period.",
  "Total margin earned":
    "Change in partner margin earned, versus the prior period.",
  "Income per booking":
    "Change in average income per booking, versus the prior period.",
  "FC guest price avg":
    "Change in the average guest price share for Flexible Cancellation, in percentage points.",
  "Insurance premium rate avg":
    "Change in the average product rate on attached bookings, in percentage points.",
  "Out of test conversion":
    "Change in conversion lift outside test cohorts, in percentage points.",
  "Conversion benefit":
    "Change in estimated partner margin from conversion uplift, versus the prior period.",
  "DDL guest price avg":
    "Change in the average Damage Deposit Waiver guest price, versus the prior period.",
  "FC Bookings by channel":
    "Change in Flexible Cancellation bookings versus the prior period.",
  "DDL Bookings by channel":
    "Change in Damage Deposit Waiver bookings versus the prior period.",
  "Partner vs Market":
    "Change in the Pikl Index versus the prior period. 100 is market average.",
  "Pikl Index Score":
    "Change in the Pikl Index versus the prior period. 100 is market average.",
  "Avg Lead Time":
    "Change in average lead time versus the prior period.",
  "Offer Conversion":
    "Change in offer conversion versus the prior period.",
}

export function getTrendHelp(label: string, value: string): string {
  return (
    TREND_HELP[label] ??
    `This figure is ${value} versus the comparison period.`
  )
}
