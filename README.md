# Inventory-Backend

## build

update config connection db in `.env` for production

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mmis_mm
DB_USER=root
DB_PASSWORD=043789124

SECRET_KEY=xxa94c1883329b47babf53df568c11d26569290c912a54d6bf884136e3ef4d120e

RECEIVE_PREFIX=REV
BORROW_PREFIX=BOR
RETURN_PREFIX=RET
ACTION_ALERT_EXPIRE=CHECK_EXPIRE_ALERT
ACTION_VEN_STATUS=ACTIVE_VEN
ACTION_ABC_STATUS=ACTIVE_ABC

PUG_PATH=./templates/pug
HTML_PATH=./templates/html
PDF_PATH=./templates/pdf
XLS_PATH=./templates/xls

PORT=3001
```
run command

```
sh build.sh
```