/**
 * Plain-English explanations for partner-facing measurement cards.
 * Prefer: what it means, then Calculation where % or per-booking maths helps.
 * Avoid em-dashes.
 */

export const METRIC_HELP: Record<string, string> = {
  "Attachment (average)":
    "Share of bookings where a guest chose Flexible Cancellation or Damage Deposit Waiver. Calculation: attached bookings ÷ total bookings.",
  Attachment:
    "Share of bookings where a guest chose Flexible Cancellation or Damage Deposit Waiver. Calculation: attached bookings ÷ total bookings.",
  "Margin (ex. VAT) £m":
    "Partner margin earned from attached products, excluding VAT.",
  "Margin (ex. VAT)":
    "Partner margin earned from attached products, excluding VAT.",
  "Incremental cancellations & relets":
    "Extra partner revenue from cancelled stays that were rebooked through Flexible Cancellation.",
  "Incremental Cancellations & Relets":
    "Extra partner revenue from cancelled stays that were rebooked through Flexible Cancellation.",
  "Inc cancellations & relets":
    "Extra partner revenue from cancelled stays that were rebooked through Flexible Cancellation.",
  "Inc Cancellations & Relets":
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
    "Average guest spend for Flexible Cancellation bookings, shown against bookings without it. Calculation: total guest spend ÷ number of bookings. A profile difference, not proven incremental demand.",
  "Average Pikl'd Stay IPB":
    "Average partner income per booking with Pikl'd Stays products. Calculation: partner income ÷ bookings with a product, shown against bookings without Flexible Cancellation. A profile difference, not proven incremental demand.",
  "Pikl Index Score":
    "Composite score of how your portfolio compares with market averages across key measures. 100 is market average.",
  "Offer Conversion":
    "Share of product-available bookings that went on to attach a Pikl product. Calculation: attached bookings ÷ bookings offered a product.",
  "Avg Lead Time":
    "Average days between booking and stay for Flexible Cancellation bookings.",
  "Partner Revenue":
    "Total partner revenue from Pikl'd Stays in the selected period.",
  "Offer Rate":
    "How often products are available on bookings, and how often they attach when offered.",

  // Pikl Market metrics
  "Cancellation rate":
    "Share of partner bookings that cancel, compared with the market average. Calculation: cancelled bookings ÷ total bookings.",
  "Attachment rate":
    "Share of bookings where a guest chose Flexible Cancellation or Damage Deposit Waiver, compared with the market. Calculation: attached bookings ÷ total bookings.",
  "Relet rate":
    "Share of cancelled stays that were successfully relet, compared with the market. Calculation: re-lets ÷ cancellations.",
  "Rebookability rate":
    "Share of cancelled stays that are successfully rebooked, compared with the market. Calculation: rebooked cancellations ÷ cancellations.",
  "Rebookability average value":
    "Average value recovered when a cancelled stay is rebooked, compared with the market. Calculation: total rebooked value ÷ number of rebooks.",

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
    "Share of bookings where Flexible Cancellation or Damage Deposit Waiver was available to the guest. Calculation: bookings offered a product ÷ total bookings.",
  "Bookings offered product":
    "Number of bookings where a Pikl product was offered to the guest.",
  "Total margin earned": "Partner margin earned from Pikl'd Stays products in the period.",
  "Income per booking":
    "Average partner income from Pikl'd Stays per booking. Calculation: total partner margin ÷ total bookings.",

  // Flexible Cancellation rate cards
  "FC guest price avg":
    "Average share of booking value charged to the guest for Flexible Cancellation. Calculation: FC guest price ÷ booking value, averaged across attached bookings.",
  "FC Guest Price Avg %":
    "Average share of booking value charged to the guest for Flexible Cancellation. Calculation: FC guest price ÷ booking value, averaged across attached bookings.",
  "Insurance premium rate avg":
    "Average product insurance rate on attached bookings. Calculation: insurance premium ÷ booking value, averaged across attached bookings.",
  "FC Insurance Premium Rate Avg %":
    "Average product insurance rate on attached Flexible Cancellation bookings. Calculation: insurance premium ÷ booking value, averaged across attached bookings.",
  "Out of test conversion":
    "Conversion lift from the product outside test cohorts. Calculation: live conversion rate − baseline conversion rate.",
  "Conversion benefit":
    "Estimated partner margin from that conversion lift. Shown as the value of about 1 percentage point of conversion.",
  "Out of Test Conversion Benefit (1% = £900,000)":
    "Estimated partner margin from conversion lift outside test. Website shows the lift rate. Direct and Total show the value of about 1 percentage point (here £900k).",
  "Out of Test Conversion Benefit":
    "Estimated partner margin from conversion lift outside test. Website shows the lift rate. Direct and Total show the estimated cash value of that lift.",

  // Damage Deposit Waiver rate cards
  "DDL guest price avg":
    "Average waiver price charged to the guest for Damage Deposit Waiver.",
  "DDL Guest Price Avg %":
    "Average waiver price charged to the guest for Damage Deposit Waiver.",
  "DDL Insurance Premium Rate Avg%":
    "Average insurance rate on Damage Deposit Waiver attachments. Calculation: insurance premium ÷ booking value, averaged across attached bookings.",
  "DDL Insurance Premium Rate Avg %":
    "Average insurance rate on Damage Deposit Waiver attachments. Calculation: insurance premium ÷ booking value, averaged across attached bookings.",

  // Insights volume / commercial panels
  "FC Bookings":
    "Number of bookings that attached Flexible Cancellation in the period.",
  "FC Bookings by channel":
    "Flexible Cancellation bookings split by website, app, offline, and OTA.",
  "When FC was purchased":
    "Flexible Cancellation bookings by the month the booking was made.",
  "Departure period booked with FC":
    "Flexible Cancellation bookings by the month of departure.",
  "Cancel rate by departure":
    "Share of Flexible Cancellation bookings that cancelled, by month of departure. Calculation: FC cancellations ÷ FC bookings for that departure month.",
  "Attachment & margin":
    "How often Flexible Cancellation attaches, and the partner margin it generates by channel.",
  "DDL Bookings":
    "Number of bookings that attached Damage Deposit Waiver in the period.",
  "DDL Bookings by channel":
    "Damage Deposit Waiver bookings split by website, app, offline, and OTA.",
  "DDL Attachment & margin":
    "How often Damage Deposit Waiver attaches, and the partner margin it generates by channel.",
  "FC Attachment":
    "Share of eligible bookings that attached Flexible Cancellation. Calculation: FC bookings ÷ bookings offered Flexible Cancellation.",
  "1pp attachment value":
    "Estimated extra partner margin if attachment rose by 1 percentage point. Calculation: current partner margin ÷ current attachment rate, by channel.",
  "FC Partner Margin":
    "Partner margin earned from Flexible Cancellation by channel.",
  "FC Partner Margin £":
    "Partner margin earned from Flexible Cancellation by channel.",
  "DDL Attachment":
    "Share of eligible bookings that attached Damage Deposit Waiver. Calculation: DDL bookings ÷ bookings offered Damage Deposit Waiver.",
  "DDL Partner Margin":
    "Partner margin earned from Damage Deposit Waiver by channel.",
  "DDL Partner Margin £":
    "Partner margin earned from Damage Deposit Waiver by channel.",

  // Contribution / channel grid % and per-booking style rows
  "Cancellation Volume":
    "Number of cancelled bookings in the period.",
  "Cancellation Avg %":
    "Average cancellation rate. Calculation: cancellations ÷ bookings.",
  "Cancellation Volume FC":
    "Forecast cancellation volume for the period.",
  "Cancellation % Avg FC":
    "Forecast average cancellation rate. Calculation: forecast cancellations ÷ forecast bookings.",
  "Relet Volume":
    "Number of cancelled stays that were successfully re-let.",
  "Re-let % Avg":
    "Share of cancellations that were re-let. Calculation: re-lets ÷ cancellations.",
  "Re-Let Value Avg":
    "Average value recovered per re-let. Calculation: total re-let value ÷ re-let volume.",
  "Re-Let Volume FC":
    "Forecast re-let volume for the period.",
  "Re-let % FC Avg":
    "Forecast share of cancellations that are re-let. Calculation: forecast re-lets ÷ forecast cancellations.",
  "Re-Let Value FC Avg":
    "Forecast average value recovered per re-let.",
  "Average Length of Booking":
    "Average nights per booking. Calculation: total nights ÷ bookings.",
  "Average Length of Booking FC":
    "Forecast average nights per booking.",
  "Average Lead time between Booking and Travel":
    "Average days between booking and arrival. Calculation: sum of lead days ÷ bookings.",
  "Average Lead time between Booking and Travel FC":
    "Forecast average days between booking and arrival.",
  "Average Holiday Value Per Booking £":
    "Average booking value. Calculation: total holiday value ÷ bookings.",
  "Average Holiday Value Per Booking with FC £":
    "Average booking value for Flexible Cancellation bookings. Calculation: FC holiday value ÷ FC bookings.",
  "Loss Ratio % on Paid Re-Let":
    "Claims and re-let costs as a share of premium related to paid re-lets. Calculation: relevant costs ÷ related premium.",
  "Split re-lets":
    "Share of re-lets filled by more than one booking, recovered value vs cancelled value for split vs single fills, and average overlap of cancelled nights. Calculation: overlapping cancelled nights ÷ cancelled nights.",
  "Partner occupancy":
    "Occupancy from the booking feed. Calculation: days booked ÷ total days available. Owner stays are not in the feed, so they are not counted as booked and are not removed from available days.",
  "Market occupancy":
    "Market average occupancy for the same departure weeks, on the same days booked ÷ days available basis.",
  "Best bedroom gap":
    "Bedroom band where partner occupancy beats the market by the largest margin.",
  "Partner vs market by departure week":
    "Partner occupancy compared with the market for each departure week. Calculation: days booked ÷ total days available for stays departing that week. Owner bookings are not in the feed.",
  "Occupancy by bedrooms":
    "Partner occupancy compared with the market by bedroom count. Calculation: days booked ÷ total days available within each bedroom band. Owner bookings are not in the feed.",
  "Occupancy method":
    "Requires full booking data. Owner bookings are not available, so occupancy is days booked ÷ total days available.",
  "How Flexible Cancellation pays back":
    "This is how you run the book for more revenue: convert guests onto cover, earn product margin, manage cancels, and re-let so cancelled holidays still pay.",
  "How Flexible Cancellation drives max revenue":
    "This is how you run the book for more revenue: convert guests onto cover, earn product margin, manage cancels, and re-let so cancelled holidays still pay. Not an add-on — the loop that keeps top-line moving.",
  "FC value loop":
    "This is how you run the book for more revenue: convert guests onto cover, earn product margin, manage cancels, and re-let so cancelled holidays still pay.",
  "FC sales":
    "Share of bookings where the guest bought Flexible Cancellation — conversion onto cover, the start of the revenue loop. Calculation: Flexible Cancellation bookings ÷ all bookings.",
  "Cover take-up":
    "Share of bookings where the guest bought Flexible Cancellation — conversion onto cover, the start of the revenue loop. Calculation: Flexible Cancellation bookings ÷ all bookings.",
  "Cancel rate":
    "Share of Flexible Cancellation bookings that were cancelled. Some cancellation is normal when guests have cover — the point is what you recover next.",
  "Guests cancelled":
    "Share of Flexible Cancellation bookings that were cancelled. Some cancellation is normal when guests have cover — the point is what you recover next.",
  "Re-let rate":
    "Share of cancelled stays that were re-let to another guest. This is how cancelled holidays turn back into revenue — and why the product is operational, not optional. Calculation: re-lets ÷ cancellations.",
  "Recovery rate":
    "Money from re-lets versus the cancelled booking value. Over 100% means you earned more than you lost. Use history by region to spot where recovery usually holds.",
  "Re-let":
    "Share of cancelled stays that were re-let to another guest. This is how cancelled holidays turn back into revenue — and why the product is operational, not optional. Calculation: re-lets ÷ cancellations.",
  "Filled again":
    "Share of cancelled stays that were re-let to another guest. This is how cancelled holidays turn back into revenue — and why the product is operational, not optional. Calculation: re-lets ÷ cancellations.",
  "Incremental £":
    "Extra revenue from re-letting cancelled Flexible Cancellation stays — commercial proof the loop is a necessity for max revenue.",
  "Extra revenue":
    "Extra revenue from re-letting cancelled Flexible Cancellation stays — commercial proof the loop is a necessity for max revenue.",
  "Loop by booking type":
    "Each card is a booking type. The top bar shows relet vs not relet. Below: ATT attachment, CXL cancel rate, REC recovered %.",
  "By bedrooms and travel dates":
    "Each card is a booking type. The top bar shows relet vs not relet. Below: ATT attachment, CXL cancel rate, REC recovered %.",
  Opportunities:
    "Where to run the business harder for max revenue: weak re-let recovery, under-sold cover where demand is strong, and proof points that show the loop already pays.",
  "Where to look next":
    "Where to run the business harder for max revenue: weak re-let recovery, under-sold cover where demand is strong, and proof points that show the loop already pays.",
  "Where to run the business":
    "Where to run the business harder for max revenue: weak re-let recovery, under-sold cover where demand is strong, and proof points that show the loop already pays.",
  "Split re-let proof":
    "A cancelled holiday re-let to more than one shorter booking, bringing in more money than the original stay — proof the ops loop grows revenue.",
  "Latest re-lets":
    "The most recent completed re-lets from live cancellations. Each row shows recovered revenue versus the cancelled booking.",
  "Example: one cancel, two new bookings":
    "A cancelled holiday re-let to more than one shorter booking, bringing in more money than the original stay.",
  "Example: one cancel, two re-lets":
    "A cancelled holiday re-let to more than one shorter booking, bringing in more money than the original stay.",
  "Recovered / cancelled":
    "Money from the re-let versus the cancelled booking. Over 100% means you earned more than you lost.",
  "Value kept":
    "Money from the re-let versus the cancelled booking. Over 100% means you earned more than you lost.",
  "Attachment heatmap":
    "CAL attachment rate across lead time, bedrooms, and departure. Swap row and column axes, and filter the third dimension. Calculation: attached bookings ÷ bookings in each cell.",
  "CAL attachment heatmap":
    "CAL attachment rate across lead time, bedrooms, and departure. Swap row and column axes, and filter the third dimension. Calculation: attached bookings ÷ bookings in each cell.",
  "Cancellation rate heatmap":
    "Cancellation rate across lead time, bedrooms, and departure. Swap row and column axes, and filter the third dimension. Calculation: cancellations ÷ bookings in each cell.",
  "Cancel rate heatmap":
    "Cancellation rate across lead time, bedrooms, and departure. Swap row and column axes, and filter the third dimension. Calculation: cancellations ÷ bookings in each cell.",
  "Re-let rate heatmap":
    "Relet rate across lead time, bedrooms, and departure. Swap row and column axes, and filter the third dimension. Calculation: relets ÷ cancellations in each cell.",
  "Relet rate heatmap":
    "Relet rate across lead time, bedrooms, and departure. Swap row and column axes, and filter the third dimension. Calculation: relets ÷ cancellations in each cell.",
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
