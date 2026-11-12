Version 7 is the finance tracker with the parts that only pretended to work taken out. The page still looks like version 6. What changed is that the buttons write real data and the outside pages read real sources.

Sign up saves the account in the browser, under that username, and login checks that same record. Logging out only ends the session. It does not wipe the transactions, so you can log back in and the rows are still there. Version 6 kept a single username and password for the whole site, and the header logout cleared storage, so the next login had nothing to check.

The organizer search looks through the description, the category, the date, and the amount. Adding a transaction, a task, or a calendar note stores it on the logged-in account and leaves the date you picked alone. Version 6 rewrote every loaded date to March 14, 2025, and the help search box was not connected to anything. Edit fills the form and saves over the same row instead of deleting it first.

Track builds the weekly or monthly summary from those saved rows. The report lists the income, the expenses, the net, and each line that fell in the window. You can download that text. The old page used three sample transactions and a warning that only mentioned food bills and loans.

Help, and the assistant on the organizer, call the language model through the dev server. The request includes the account totals, the recent rows, the tasks, and the notes, and the reply is supposed to stay inside that list. The canned lines about water bills and a fixed number of deposits are gone. The old forum links went nowhere, so the sidebar now opens Organizer, Track, and Trends.

Trends asks Yahoo for the daily price on Apple, Tesla, Google, and Amazon. The symbol opens the Yahoo quote page, and the session time is the one Yahoo sent back. The news blocks are Yahoo headlines with the publisher, the time, and the article link. The example.com stories and the made-up business blurbs are gone. The tax table is tax year 2026 from IRS Revenue Procedure 2025-32, and each row links to the IRS page or the statute. Those figures change by tax year, not by the trading day, and there is no single U.S. sales tax, so that 8.5% row is gone. Kids mode search filters the products, and a logged-in balance survives a refresh.

To run it, from the version-7 folder:

npm install

npx ng serve

Open http://localhost:4200/. Trends and help need that dev server because Yahoo and the chat call go through the proxy. Neither one needs a key.
