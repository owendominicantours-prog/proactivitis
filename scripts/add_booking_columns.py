import sqlite3
conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()
statements = [
    "ALTER TABLE Booking ADD COLUMN customerName TEXT",
    "ALTER TABLE Booking ADD COLUMN customerEmail TEXT",
    "ALTER TABLE Booking ADD COLUMN customerPhone TEXT",
    "ALTER TABLE Booking ADD COLUMN paxAdults INTEGER DEFAULT 1",
    "ALTER TABLE Booking ADD COLUMN paxChildren INTEGER DEFAULT 0",
    "ALTER TABLE Booking ADD COLUMN hotel TEXT",
    "ALTER TABLE Booking ADD COLUMN pickupNotes TEXT",
    "ALTER TABLE Booking ADD COLUMN source TEXT DEFAULT 'WEB'",
    "ALTER TABLE Booking ADD COLUMN cancellationReason TEXT",
    "ALTER TABLE Booking ADD COLUMN cancellationByRole TEXT",
    "ALTER TABLE Booking ADD COLUMN cancellationAt DATETIME"
]
for stmt in statements:
    try:
        c.execute(stmt)
    except sqlite3.OperationalError as e:
        if 'duplicate column name' in str(e):
            continue
        raise
conn.commit()
conn.close()
