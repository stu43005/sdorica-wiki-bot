# 產生 https 憑證
openssl genrsa -des3 -out rootCA.key 4096
openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 36500 -out rootCA.crt

openssl genrsa -out rayark.download.key 2048
openssl req -new -sha256 -nodes -key rayark.download.key -out rayark.download.csr -config rayark.download.cnf
openssl x509 -req -in rayark.download.csr -CA rootCA.crt -CAkey rootCA.key -CAcreateserial -out rayark.download.crt -days 36500 -sha256 -extfile rayark.download-v3.ext


# 產生 android 用信任憑證
CRT_FILENAME=$(openssl x509 -inform PEM -subject_hash_old -in rootCA.crt | head -1).0
cat rootCA.crt > $CRT_FILENAME
openssl x509 -inform PEM -text -in rootCA.crt -noout >> $CRT_FILENAME

# cp $CRT_FILENAME /system/etc/security/cacerts/
