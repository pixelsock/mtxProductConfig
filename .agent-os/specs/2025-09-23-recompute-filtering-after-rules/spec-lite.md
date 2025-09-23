# Spec Summary (Lite)

Fix the filtering logic to recompute available/disabled options after rules have been applied, ensuring the UI shows correct availability based on the post-rule configuration state. The filtering system currently calculates availability before rules modify the configuration and never re-runs, causing incorrect disabled states after initialization and rule enforcement.