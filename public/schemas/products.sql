CREATE TABLE "products" (
	 "product_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
     "name" TEXT(255,0) NOT NULL,
	 "price" DECIMAL NOT NULL,
	 "cost_price" DECIMAL NOT NULL,
	 "stock" INTEGER NOT NULL
);
