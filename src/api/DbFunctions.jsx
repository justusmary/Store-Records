import SQL from 'sql.js'
import { isArray } from 'util';
const electron = window.require('electron')
const fs = electron.remote.require('fs')
const app = electron.remote.app
const dbFile = app.getPath("userData").replace(/\\/g, '/') + '/CYJEGYSFIOMP'

var folder = "/public/"
if (process.env.NODE_ENV === 'production') {
    folder = "/build/"
}


export class DbFunctions {
    
    createDatabase() {
        var query = (
            fs.readFileSync(app.getAppPath().replace(/\\/g, '/') + folder + 'schemas/customers.sql', 'utf8') +
            fs.readFileSync(app.getAppPath().replace(/\\/g, '/') + folder + 'schemas/products.sql', 'utf8') + 
            fs.readFileSync(app.getAppPath().replace(/\\/g, '/') + folder + 'schemas/transactions.sql', 'utf8') +
            fs.readFileSync(app.getAppPath().replace(/\\/g, '/') + folder + 'schemas/prices.sql', 'utf8') +
            fs.readFileSync(app.getAppPath().replace(/\\/g, '/') + folder + 'schemas/stocks.sql', 'utf8')
        )
        var db = new SQL.Database()
        db.exec(query)
        fs.writeFileSync(dbFile, db.export())
        db.close()
    }

    insert(table, values) {
        var query = "INSERT INTO " + table + " VALUES ("
        for (var i = 0; i < values.length; i++) {
            if (typeof(values[i]) === "string" && values[i] !== "NULL") {
                if (i === 0)  query = query + "\"" + values[i] + "\""
                else query = query + ", \"" + values[i] + "\""
            }
            else {
                if (i === 0) query = query + values[i]
                else query = query + ", " + values[i]
            }
        }
        query = query + ")"
        var buffer = fs.readFileSync(dbFile)
        var db = new SQL.Database(buffer)
        db.exec(query)
        fs.writeFileSync(dbFile, db.export())
        db.close()
    }

    selectAll(table) {
        var query = "SELECT * FROM " + table
        var buffer = fs.readFileSync(dbFile)
        var db = new SQL.Database(buffer)
        var result = db.exec(query)
        db.close()
        try {
            return result[0].values
        }
        catch (e) {
            return []
        }
    }

    selectRow(table, column, id) {
        var query = "SELECT * FROM " + table + " WHERE " + column + "=\"" + id + "\""
        var buffer = fs.readFileSync(dbFile)
        var db = new SQL.Database(buffer)
        var result = db.exec(query)
        db.close()
        try {
            return result[0].values
        }
        catch(e) {
            return []
        }
    }

    selectFromRow(table, column, key, id) {
        var query = "SELECT " + column + " FROM " + table + " WHERE " + key + "=\"" + id + "\""
        var buffer = fs.readFileSync(dbFile)
        var db = new SQL.Database(buffer)
        var result = db.exec(query)
        db.close()
        try {
            return result[0].values
        }
        catch(e) {
            return []
        }
    }

    selectColTitle(table) {
        var query = "SELECT * FROM " + table
        var buffer = fs.readFileSync(dbFile)
        var db = new SQL.Database(buffer)
        var result = db.exec(query)
        db.close()
        try {
            return result[0].columns
        }
        catch (e) {
            return []
        }
    }

    selectColumn(table, column) {
        var query = "SELECT " + column + " FROM " + table
        var buffer = fs.readFileSync(dbFile)
        var db = new SQL.Database(buffer)
        var result = db.exec(query)
        db.close()
        try {
            return result[0].values
        }
        catch(e) {
            return []
        }
    }

    selectColumnWhere(table, column, key, value) {
        var query = "SELECT " + column + " FROM " + table + " WHERE " + key + "=\"" + value + "\""
        var buffer = fs.readFileSync(dbFile)
        var db = new SQL.Database(buffer)
        var result = db.exec(query)
        db.close()
        try {
            return result[0].values
        }
        catch(e) {
            return []
        }
    }

    selectField(table, field, id, value) {
        var query = "SELECT " + field + " FROM " + table + " WHERE " + id + "= \"" + value + "\""
        var buffer = fs.readFileSync(dbFile)
        var db = new SQL.Database(buffer)
        var result = db.exec(query)
        db.close()
        try {
            return result[0].values[0]
        }
        catch(e) {
            return ""
        }
    }

    selectBetween(table, column, lowerLimit, upperLimit) {
        var query = "SELECT * FROM " + table + " WHERE " + column + " BETWEEN \"" + lowerLimit + "\" AND \"" + upperLimit + "\""
        var buffer = fs.readFileSync(dbFile)
        var db = new SQL.Database(buffer)
        var result = db.exec(query)
        db.close()
        try {
            return result[0].values
        }
        catch(e) {
            return []
        }
    }

    selectFromBetween(table, column, key, lowerLimit, upperLimit) {
        var query = "SELECT " + column + " FROM " + table + " WHERE " + key + " BETWEEN \"" + lowerLimit + "\" AND \"" + upperLimit + "\""
        var buffer = fs.readFileSync(dbFile)
        var db = new SQL.Database(buffer)
        var result = db.exec(query)
        db.close()
        try {
            return result[0].values
        }
        catch(e) {
            return ""
        }
    }

    updateRow(table, columns, values, key, value) {
        var query = "UPDATE " + table + " SET "
        if (isArray(columns)) {
            for (var i = 0; i < columns.length; i++) {
                if (i === 0) {
                    query = query + columns[i] + "=\"" + values[i] + "\""
                }
                else {
                    query = query + ", " + columns[i] + "=\"" + values[i] + "\""
                }
            }
        }
        else {
            query = query + columns + "=" + values
        }

        query = query + " WHERE " + key + "="
        query = query + "\"" + value + "\""
        var buffer = fs.readFileSync(dbFile)
        var db = new SQL.Database(buffer)
        db.exec(query)
        fs.writeFileSync(dbFile, db.export())
        db.close()
    }

    addColumn(table, column) {
        var buffer = fs.readFileSync(dbFile)
        var db = new SQL.Database(buffer)
        var query = "ALTER TABLE " + table + " ADD \"" + column + "\" DECIMAL"
        db.exec(query)
        fs.writeFileSync(dbFile, db.export())
        db.close()
    }

    deleteRow(table, key, value) {
        var query = 'DELETE FROM ' + table + ' WHERE ' + key + "=\"" + value + "\""
        var buffer = fs.readFileSync(dbFile)
        var db = new SQL.Database(buffer)
        db.exec(query)
        fs.writeFileSync(dbFile, db.export())
        db.close()
    }

}

const DB = new DbFunctions()
export default DB
