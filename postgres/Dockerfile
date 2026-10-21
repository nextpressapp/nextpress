FROM postgres:latest@sha256:1267c7e692de235fda2a50dbcdbcbca4672ea6a0298576a6bd9d07cafc319b32

RUN cd /var/lib/postgresql/ && \
    openssl req -new -text -passout pass:abcd -subj /CN=localhost -out server.req -keyout privkey.pem && \
    openssl rsa -in privkey.pem -passin pass:abcd -out server.key && \
    openssl req -x509 -in server.req -text -key server.key -out server.crt && \
    chmod 600 server.key && \
    chown postgres:postgres server.key

CMD ["postgres", "-c", "ssl=on", "-c", "ssl_cert_file=/var/lib/postgresql/server.crt", "-c", "ssl_key_file=/var/lib/postgresql/server.key" ]