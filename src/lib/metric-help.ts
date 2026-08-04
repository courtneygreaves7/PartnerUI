/**
 * Partner-facing help for measurement cards and chips.
 * Style: plain language first, then spell out acronyms in ().
 * Prefer: what it means, then How we calculate it where maths helps.
 */

export const METRIC_HELP: Record<string, string> = {
  "Attachment (average)":
    "Share of bookings where a guest bought Flexible Cancellation (FC) or Damage Deposit Waiver (DDL). How we calculate it: attached bookings ÷ total bookings.",
  Attachment:
    "Share of bookings where a guest bought Flexible Cancellation (FC) or Damage Deposit Waiver (DDL). How we calculate it: attached bookings ÷ total bookings.",
  "Margin (ex. VAT) £m":
    "Your share of earnings from attached products, before VAT.",
  "Margin (ex. VAT)":
    "Your share of earnings from attached products, before VAT.",
  "Incremental cancellations & relets":
    "Extra money you earned when a cancelled stay was rebooked through Flexible Cancellation (FC).",
  "Incremental Cancellations & Relets":
    "Extra money you earned when a cancelled stay was rebooked through Flexible Cancellation (FC).",
  "Inc cancellations & relets":
    "Extra money you earned when a cancelled stay was rebooked through Flexible Cancellation (FC).",
  "Inc Cancellations & Relets":
    "Extra money you earned when a cancelled stay was rebooked through Flexible Cancellation (FC).",
  "Website conversion*":
    "Estimated extra partner revenue when offering these products helps more website visitors complete a booking.",
  "Website conversion":
    "Estimated extra partner revenue when offering these products helps more website visitors complete a booking.",
  Total: "Total partner revenue from Pikl'd Stays in the selected period.",
  "Gross bookings":
    "Total booking volume in the period. This is the base for availability and attachment. It is not extra bookings caused by Flexible Cancellation (FC).",
  "Average lead time":
    "Average days between booking and arrival for Flexible Cancellation (FC) stays, shown against bookings without FC. A profile difference, not proof that FC caused the change.",
  "Average length of stay":
    "Average nights per stay for Flexible Cancellation (FC) bookings, shown against bookings without FC. A profile difference, not proof that FC caused the change.",
  "Avg spend per booking":
    "Average guest spend for Flexible Cancellation (FC) bookings, shown against bookings without FC. How we calculate it: total guest spend ÷ number of bookings. A profile difference, not proof that FC caused the change.",
  "Average Pikl'd Stay IPB":
    "Average partner Income Per Booking (IPB) when a Pikl'd Stays product is attached. How we calculate it: partner income ÷ bookings with a product, shown against bookings without Flexible Cancellation (FC).",
  "Pikl Index Score":
    "Overall score of how your portfolio compares with market averages. 100 means you match the market average.",
  "Offer Conversion":
    "Of bookings where a product was offered, how often a guest bought one. How we calculate it: attached bookings ÷ bookings offered a product.",
  "Avg Lead Time":
    "Average days between booking and stay for Flexible Cancellation (FC) bookings.",
  "Partner Revenue":
    "Total partner revenue from Pikl'd Stays in the selected period.",
  "Offer Rate":
    "How often products are available on bookings, and how often guests buy them when offered.",

  // Pikl Market metrics
  "Cancellation rate":
    "Share of partner bookings that cancel, compared with the market average. How we calculate it: cancelled bookings ÷ total bookings.",
  "Attachment rate":
    "Share of bookings where a guest bought Flexible Cancellation (FC) or Damage Deposit Waiver (DDL), compared with the market. How we calculate it: attached bookings ÷ total bookings.",
  "Relet rate":
    "Share of cancelled stays that were filled again (re-let), compared with the market. How we calculate it: re-lets ÷ cancellations.",
  "Rebookability rate":
    "Share of cancelled stays that are successfully rebooked, compared with the market. How we calculate it: rebooked cancellations ÷ cancellations.",
  "Rebookability average value":
    "Average value recovered when a cancelled stay is rebooked, compared with the market. How we calculate it: total rebooked value ÷ number of rebooks.",

  // Chart / summary cards
  "Revenue Drivers":
    "How total partner revenue splits across product margin, website conversion uplift, and money from cancelled stays that were re-let.",
  "Gross bookings trend":
    "Monthly booking volume over time, so you can see seasonality and growth.",
  "Partner vs Market":
    "Your portfolio versus market averages on key booking and stay measures. Blue is you. Grey is the market.",

  // Insights top summary
  "Total bookings": "All partner bookings in the selected period across brands and channels.",
  "Bookings offered a product":
    "Share of bookings where Flexible Cancellation (FC) or Damage Deposit Waiver (DDL) was available to the guest. How we calculate it: bookings offered a product ÷ total bookings.",
  "Bookings offered product":
    "Number of bookings where a Pikl product was offered to the guest.",
  "Total margin earned": "Partner margin earned from Pikl'd Stays products in the period.",
  "Income per booking":
    "Average partner income from Pikl'd Stays per booking. How we calculate it: total partner margin ÷ total bookings.",

  // Flexible Cancellation rate cards
  "FC guest price avg":
    "Average share of booking value the guest paid for Flexible Cancellation (FC). How we calculate it: FC guest price ÷ booking value, averaged across attached bookings.",
  "FC Guest Price Avg %":
    "Average share of booking value the guest paid for Flexible Cancellation (FC). How we calculate it: FC guest price ÷ booking value, averaged across attached bookings.",
  "Insurance premium rate avg":
    "Average insurance rate on attached bookings. How we calculate it: insurance premium ÷ booking value, averaged across attached bookings.",
  "FC Insurance Premium Rate Avg %":
    "Average insurance rate on attached Flexible Cancellation (FC) bookings. How we calculate it: insurance premium ÷ booking value, averaged across attached bookings.",
  "Out of test conversion":
    "Extra conversion from the product outside test groups. How we calculate it: live conversion rate − baseline conversion rate.",
  "Conversion benefit":
    "Estimated partner margin from that conversion lift. Shown as the value of about 1 percentage point of conversion.",
  "Out of Test Conversion Benefit (1% ≈ £520k)":
    "Estimated partner margin from conversion lift outside test. Website shows the lift rate. Direct and Total show the value of about 1 percentage point (here about £520k).",
  "Out of Test Conversion Benefit (1% = £520,000)":
    "Estimated partner margin from conversion lift outside test. Website shows the lift rate. Direct and Total show the value of about 1 percentage point (here £520k).",
  "Out of Test Conversion Benefit":
    "Estimated partner margin from conversion lift outside test. Website shows the lift rate. Direct and Total show the estimated cash value of that lift.",

  // Damage Deposit Waiver rate cards
  "DDL guest price avg":
    "Average price charged to the guest for Damage Deposit Waiver (DDL).",
  "DDL Guest Price Avg %":
    "Average price charged to the guest for Damage Deposit Waiver (DDL).",
  "DDL Insurance Premium Rate Avg%":
    "Average insurance rate on Damage Deposit Waiver (DDL) attachments. How we calculate it: insurance premium ÷ booking value, averaged across attached bookings.",
  "DDL Insurance Premium Rate Avg %":
    "Average insurance rate on Damage Deposit Waiver (DDL) attachments. How we calculate it: insurance premium ÷ booking value, averaged across attached bookings.",

  // Insights volume / commercial panels
  "FC Bookings":
    "Number of bookings that bought Flexible Cancellation (FC) in the period.",
  "FC Bookings by channel":
    "Flexible Cancellation (FC) bookings split by website, app, offline, and Online Travel Agency (OTA).",
  "When FC was purchased":
    "Flexible Cancellation (FC) bookings by the month the booking was made.",
  "Departure period booked with FC":
    "Flexible Cancellation (FC) bookings by the month of departure.",
  "Cancel rate by departure":
    "Share of Flexible Cancellation (FC) bookings that cancelled, by month of departure. How we calculate it: FC cancellations ÷ FC bookings for that departure month.",
  "Attachment & margin":
    "How often Flexible Cancellation (FC) is bought, and the partner margin it generates by channel.",
  "DDL Bookings":
    "Number of bookings that bought Damage Deposit Waiver (DDL) in the period.",
  "DDL Bookings by channel":
    "Damage Deposit Waiver (DDL) bookings split by website, app, offline, and Online Travel Agency (OTA).",
  "DDL Attachment & margin":
    "How often Damage Deposit Waiver (DDL) is bought, and the partner margin it generates by channel.",
  "FC Attachment":
    "Share of eligible bookings that bought Flexible Cancellation (FC). How we calculate it: FC bookings ÷ bookings offered FC.",
  "1pp attachment value":
    "Estimated extra partner margin if attachment rose by 1 percentage point (1pp). How we calculate it: current partner margin ÷ current attachment rate, by channel.",
  "FC Partner Margin":
    "Partner margin earned from Flexible Cancellation (FC) by channel.",
  "FC Partner Margin £":
    "Partner margin earned from Flexible Cancellation (FC) by channel.",
  "DDL Attachment":
    "Share of eligible bookings that bought Damage Deposit Waiver (DDL). How we calculate it: DDL bookings ÷ bookings offered DDL.",
  "DDL Partner Margin":
    "Partner margin earned from Damage Deposit Waiver (DDL) by channel.",
  "DDL Partner Margin £":
    "Partner margin earned from Damage Deposit Waiver (DDL) by channel.",

  // Contribution / channel grid % and per-booking style rows
  "Cancellation Volume":
    "Number of cancelled bookings in the period.",
  "Cancellation Avg %":
    "Average cancellation rate. How we calculate it: cancellations ÷ bookings.",
  "Cancellation Volume FC":
    "Forecast (FC) cancellation volume for the period — the number you planned for, not Flexible Cancellation.",
  "Cancellation % Avg FC":
    "Forecast (FC) average cancellation rate. How we calculate it: forecast cancellations ÷ forecast bookings.",
  "Relet Volume":
    "Number of cancelled stays that were successfully filled again (re-let).",
  "Re-let % Avg":
    "Share of cancellations that were re-let. How we calculate it: re-lets ÷ cancellations.",
  "Re-Let Value Avg":
    "Average value recovered per re-let. How we calculate it: total re-let value ÷ re-let volume.",
  "Re-Let Volume FC":
    "Forecast (FC) re-let volume for the period — the number you planned for.",
  "Re-let % FC Avg":
    "Forecast (FC) share of cancellations that are re-let. How we calculate it: forecast re-lets ÷ forecast cancellations.",
  "Re-Let Value FC Avg":
    "Forecast (FC) average value recovered per re-let.",
  "Average Length of Booking":
    "Average nights per booking. How we calculate it: total nights ÷ bookings.",
  "Average Length of Booking FC":
    "Forecast (FC) average nights per booking.",
  "Average Lead time between Booking and Travel":
    "Average days between booking and arrival. How we calculate it: sum of lead days ÷ bookings.",
  "Average Lead time between Booking and Travel FC":
    "Forecast (FC) average days between booking and arrival.",
  "Average Holiday Value Per Booking £":
    "Average booking value. How we calculate it: total holiday value ÷ bookings.",
  "Average Holiday Value Per Booking with FC £":
    "Average booking value for Flexible Cancellation (FC) bookings. How we calculate it: FC holiday value ÷ FC bookings.",
  "Loss Ratio % on Paid Re-Let":
    "Claims and re-let costs as a share of related premium. How we calculate it: relevant costs ÷ related premium.",
  "Split re-lets":
    "Share of re-lets filled by more than one booking, recovered value vs cancelled value for split vs single fills, and average overlap of cancelled nights. How we calculate it: overlapping cancelled nights ÷ cancelled nights.",
  "Partner occupancy":
    "Occupancy from the booking feed. How we calculate it: days booked ÷ total days available. Owner stays are not in the feed, so they are not counted as booked and are not removed from available days.",
  "Market occupancy":
    "Market average occupancy for the same departure weeks, on the same days booked ÷ days available basis. This is the benchmark you are measured against.",
  "Best bedroom gap":
    "Bedroom band where your occupancy beats the market by the largest margin. Compare with the weakest band to see where mix or pricing needs work.",
  "Partner vs market by departure week":
    "Your occupancy compared with the market for each departure week. How we calculate it: days booked ÷ total days available for stays departing that week. Owner bookings are not in the feed.",
  "Occupancy by bedrooms":
    "Your occupancy compared with the market by bedroom count. How we calculate it: days booked ÷ total days available within each bedroom band. Owner bookings are not in the feed.",
  "Occupancy method":
    "Occupancy = days booked ÷ total days available from the booking feed. Owner stays are not in the feed, so they are not counted as booked and not removed from available days.",
  "How Flexible Cancellation pays back":
    "How Flexible Cancellation (FC) pays you back: guests buy cover, you earn product margin, some cancel (expected), and you re-let so cancelled holidays still earn.",
  "How Flexible Cancellation drives max revenue":
    "How Flexible Cancellation (FC) drives revenue: guests buy cover, you earn product margin, some cancel (expected), and you re-let so cancelled holidays still earn.",
  "FC value loop":
    "How Flexible Cancellation (FC) pays you back: guests buy cover, you earn product margin, some cancel (expected), and you re-let so cancelled holidays still earn.",
  "FC sales":
    "Share of bookings where the guest bought Flexible Cancellation (FC) — take-up of cover, the start of the revenue loop. How we calculate it: FC bookings ÷ all bookings.",
  "Cover take-up":
    "Share of bookings where the guest bought Flexible Cancellation (FC) — take-up of cover, the start of the revenue loop. How we calculate it: FC bookings ÷ all bookings.",
  "Cancel rate":
    "Share of Flexible Cancellation (FC) bookings that were cancelled. Some cancellation is normal when guests have cover — the point is what you recover next.",
  "Cancel":
    "Share of Flexible Cancellation (FC) bookings that were cancelled. Some cancellation is normal when guests have cover — the point is what you recover next.",
  "Guests cancelled":
    "Share of Flexible Cancellation (FC) bookings that were cancelled. Some cancellation is normal when guests have cover — the point is what you recover next.",
  "Re-let rate":
    "Share of cancelled stays that were filled again (re-let). This is how cancelled holidays turn back into revenue. How we calculate it: re-lets ÷ cancellations.",
  "Recovery rate":
    "Money from re-lets versus the cancelled booking value. Over 100% means you earned more than you lost. Use history by region to spot where recovery usually holds.",
  "Re-let":
    "Share of cancelled stays that were filled again (re-let). This is how cancelled holidays turn back into revenue. How we calculate it: re-lets ÷ cancellations.",
  "Filled again":
    "Share of cancelled stays that were filled again (re-let). This is how cancelled holidays turn back into revenue. How we calculate it: re-lets ÷ cancellations.",
  "Incremental £":
    "Extra revenue from re-letting cancelled Flexible Cancellation (FC) stays — proof that cover plus ops work together.",
  "Extra revenue":
    "Extra revenue from re-letting cancelled Flexible Cancellation (FC) stays — proof that cover plus ops work together.",
  "Loop by booking type":
    "Each card is a booking type. The top bar shows re-let vs not re-let. Below: ATT (attachment), CXL (cancel rate), REC (recovered % of cancelled value).",
  "By bedrooms and travel dates":
    "Each card is a booking type. The top bar shows re-let vs not re-let. Below: ATT (attachment), CXL (cancel rate), REC (recovered % of cancelled value).",
  Opportunities:
    "Where to push harder: weak re-let recovery, under-sold cover where demand is strong, and proof points that show the loop already pays.",
  "Where to look next":
    "Where to push harder: weak re-let recovery, under-sold cover where demand is strong, and proof points that show the loop already pays.",
  "Where to run the business":
    "Where to push harder: weak re-let recovery, under-sold cover where demand is strong, and proof points that show the loop already pays.",
  "Split re-let proof":
    "A cancelled holiday re-let to more than one shorter booking, bringing in more money than the original stay — proof the ops loop can grow revenue.",
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
    "Flexible Cancellation (FC) attachment across lead time, bedrooms, and departure. Swap rows and columns, and filter the third dimension. How we calculate it: attached bookings ÷ bookings in each cell.",
  "CAL attachment heatmap":
    "Flexible Cancellation (FC / CAL) attachment across lead time, bedrooms, and departure. Swap rows and columns, and filter the third dimension. How we calculate it: attached bookings ÷ bookings in each cell.",
  "Cancellation rate heatmap":
    "Cancellation rate across lead time, bedrooms, and departure. Swap rows and columns, and filter the third dimension. How we calculate it: cancellations ÷ bookings in each cell.",
  "Cancel rate heatmap":
    "Cancellation rate across lead time, bedrooms, and departure. Swap rows and columns, and filter the third dimension. How we calculate it: cancellations ÷ bookings in each cell.",
  "Re-let rate heatmap":
    "Re-let rate across lead time, bedrooms, and departure. Swap rows and columns, and filter the third dimension. How we calculate it: re-lets ÷ cancellations in each cell.",
  "Relet rate heatmap":
    "Re-let rate across lead time, bedrooms, and departure. Swap rows and columns, and filter the third dimension. How we calculate it: re-lets ÷ cancellations in each cell.",
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
    "Change in total booking volume versus the prior period. Not an incremental Flexible Cancellation (FC) impact.",
  "Average lead time":
    "Difference versus bookings without Flexible Cancellation (FC). Profile comparison, not proof of cause.",
  "Average length of stay":
    "Difference versus bookings without Flexible Cancellation (FC). Profile comparison, not proof of cause.",
  "Avg spend per booking":
    "Difference versus bookings without Flexible Cancellation (FC). Profile comparison, not proof of cause.",
  "Average Pikl'd Stay IPB":
    "Difference versus bookings without Flexible Cancellation (FC). Profile comparison, not proof of cause. IPB means Income Per Booking.",
  "Gross bookings trend":
    "Change in total booking volume versus the prior period. Volume context, not incremental product impact.",
  "Cancellation rate":
    "Change in cancellation rate versus the prior period. A fall is usually better for retained revenue.",
  "Attachment rate":
    "Change in attachment rate versus the prior period, in percentage points (pp).",
  "Relet rate":
    "Change in re-let rate versus the prior period, in percentage points (pp).",
  "Rebookability rate":
    "Change in the share of cancelled stays that were rebooked, versus the prior period.",
  "Rebookability average value":
    "Change in average value recovered when a cancelled stay is rebooked, versus the prior period.",
  "Total bookings":
    "Change in total bookings versus the prior period.",
  "Bookings offered a product":
    "Change in the share of bookings offered a product, in percentage points (pp) versus the prior period.",
  "Bookings offered product":
    "Change in the number of bookings offered a product, versus the prior period.",
  "Total margin earned":
    "Change in partner margin earned, versus the prior period.",
  "Income per booking":
    "Change in average income per booking, versus the prior period.",
  "FC guest price avg":
    "Change in the average guest price share for Flexible Cancellation (FC), in percentage points (pp).",
  "Insurance premium rate avg":
    "Change in the average product rate on attached bookings, in percentage points (pp).",
  "Out of test conversion":
    "Change in conversion lift outside test groups, in percentage points (pp).",
  "Conversion benefit":
    "Change in estimated partner margin from conversion uplift, versus the prior period.",
  "DDL guest price avg":
    "Change in the average Damage Deposit Waiver (DDL) guest price, versus the prior period.",
  "FC Bookings by channel":
    "Change in Flexible Cancellation (FC) bookings versus the prior period.",
  "DDL Bookings by channel":
    "Change in Damage Deposit Waiver (DDL) bookings versus the prior period.",
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
