CREATE TABLE "transactions" (
	 "transaction_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	 "customer_id" INTEGER NOT NULL,
     "product_id" INTEGER NOT NULL,
     "number" INTEGER NOT NULL,
     "price" DECIMAL NOT NULL,
     "paid" DECIMAL NOT NULL,
     "balance" DECIMAL NOT NULL,
     "profit" DECIMAL NOT NULL,
     "date" DATE NOT NULL
);
