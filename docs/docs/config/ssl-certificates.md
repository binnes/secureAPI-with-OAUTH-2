# SSL Certificate Configuration

This guide explains how to configure OpenLiberty to work with self-signed SSL certificates, which is essential when connecting to Keycloak instances using custom Certificate Authorities (CA).

## Why is This Needed?

When Keycloak uses self-signed certificates or certificates issued by a custom CA (like a home lab CA), OpenLiberty cannot validate the certificate chain by default. This causes errors when:

- Fetching JWKS (JSON Web Key Set) from Keycloak
- Validating JWT tokens
- Making any HTTPS requests to Keycloak

**Common error:**
```
PKIX path building failed: unable to find valid certification path to requested target
```

## Understanding the Certificate Chain

A typical certificate chain looks like this:

```
Root CA (HomeLab CA Root CA)
    ↓
Intermediate CA (Home Lab Intermediate)
    ↓
Server Certificate (keycloak.lab.home)
```

OpenLiberty needs to trust the entire chain to validate the server certificate.

## Prerequisites

- OpenLiberty installed
- Access to your CA certificates (root and intermediate)
- Keycloak running with self-signed certificates

## Solution Overview

We need to:

1. Export CA certificates from Keycloak
2. Import CA certificates into OpenLiberty's truststore
3. Configure OpenLiberty to use the truststore
4. Verify the configuration

## Step 1: Export CA Certificates

=== "From Keycloak Server"

    If you have access to the Keycloak server:

    ```bash
    # Export the certificate chain from Keycloak
    echo | openssl s_client -connect keycloak.lab.home:443 -showcerts 2>/dev/null | \
      openssl x509 -outform PEM > keycloak-server.crt

    # View certificate details
    openssl x509 -in keycloak-server.crt -noout -subject -issuer
    ```

=== "From Browser"

    1. **Navigate to Keycloak** in your browser
    2. **Click the padlock icon** in the address bar
    3. **View certificate details**
    4. **Export each certificate** in the chain:
        - Server certificate
        - Intermediate CA certificate
        - Root CA certificate
    5. **Save as PEM format** (`.crt` or `.pem` files)

=== "Provided by Administrator"

    If your administrator provides the CA certificates, save them to a `certs/` directory:

    ```bash
    mkdir -p certs
    # Copy provided certificates
    cp /path/to/root_ca.crt certs/
    cp /path/to/intermediate_ca.crt certs/
    ```

## Step 2: Verify Certificate Chain

Before importing, verify the certificate chain is complete:

```bash
# Check root CA
openssl x509 -in certs/root_ca.crt -noout -subject -issuer

# Check intermediate CA
openssl x509 -in certs/intermediate_ca.crt -noout -subject -issuer

# Verify the chain
openssl verify -CAfile certs/root_ca.crt certs/intermediate_ca.crt
```

**Expected output:**
```
certs/intermediate_ca.crt: OK
```

## Step 3: Import Certificates into Truststore

This assumes you have a separate RootCA certificate, and intermediate certificate and a server certificate chain, adjust as needed.
OpenLiberty uses a PKCS12 keystore located at:
```
API_server/target/liberty/wlp/usr/servers/authTestServer/resources/security/key.p12
```

### Import Root CA Certificate

```bash
keytool -import \
  -alias homelab-root-ca \
  -file certs/root_ca.crt \
  -keystore API_server/target/liberty/wlp/usr/servers/authTestServer/resources/security/key.p12 \
  -storepass changeit \
  -noprompt
```

### Import Intermediate CA Certificate

```bash
keytool -import \
  -alias homelab-intermediate-ca \
  -file certs/intermediate_ca.crt \
  -keystore API_server/target/liberty/wlp/usr/servers/authTestServer/resources/security/key.p12 \
  -storepass changeit \
  -noprompt
```

### Verify Imports

List all certificates in the keystore:

```bash
keytool -list \
  -keystore API_server/target/liberty/wlp/usr/servers/authTestServer/resources/security/key.p12 \
  -storepass changeit
```

**Expected output:**
```
Keystore type: PKCS12
Keystore provider: SUN

Your keystore contains 8 entries

default, 28 Jan 2026, PrivateKeyEntry
homelab-root-ca, 28 Jan 2026, trustedCertEntry
homelab-intermediate-ca, 28 Jan 2026, trustedCertEntry
...
```

## Step 4: Configure OpenLiberty

### Update server.xml

Configure SSL settings in [`API_server/src/main/liberty/config/server.xml`](../config/server.md):

```xml
<!-- SSL Configuration for JWT/JWKS endpoint -->
<ssl id="jwtSSLConfig"
     keyStoreRef="defaultKeyStore"
     trustDefaultCerts="true"
     verifyHostname="false"
     sslProtocol="TLSv1.2"
     clientAuthentication="false"
     clientAuthenticationSupported="false"/>

<!-- Outbound SSL configuration for REST clients -->
<sslDefault outboundSSLRef="jwtSSLConfig"/>

<!-- Keystore configuration -->
<keyStore id="defaultKeyStore"
          password="changeit"/>

<!-- MicroProfile JWT Configuration -->
<mpJwt id="jwtConfig"
       jwksUri="${env.JWT_JWKS_URI}"
       issuer="${env.JWT_ISSUER}"
       audiences="authentication-test-api"
       groupNameAttribute="groups"
       userNameAttribute="preferred_username"
       sslRef="jwtSSLConfig"/>
```

### Key Configuration Options

- **`trustDefaultCerts="true"`** - Trust system default certificates
- **`verifyHostname="false"`** - Disable hostname verification (development only)
- **`sslProtocol="TLSv1.2"`** - Use TLS 1.2 or higher
- **`sslRef="jwtSSLConfig"`** - Reference SSL configuration in mpJwt

!!! warning "Production Settings"
    For production, set `verifyHostname="true"` and ensure certificates have correct hostnames.

### Optional: JVM Options for Development

For development environments, you can add JVM options to disable strict SSL validation:

Create [`API_server/src/main/liberty/config/jvm.options`](../config/server.md):

```
# Disable strict SSL validation (DEVELOPMENT ONLY)
-Dcom.ibm.jsse2.overrideDefaultTLS=true
-Djavax.net.ssl.trustAll=true
-Djdk.internal.httpclient.disableHostnameVerification=true

# Memory settings
-Xmx512m
-Xms256m
```

!!! danger "Security Warning"
    Never use these JVM options in production! They disable SSL certificate validation entirely.

## Step 5: Restart OpenLiberty

After importing certificates and updating configuration:

```bash
# Stop the server
cd API_server
mvn liberty:stop

# Start in dev mode
mvn liberty:dev
```

Or for a full restart:

```bash
# Complete restart
cd API_server
mvn liberty:stop && sleep 3 && mvn liberty:dev
```

## Step 6: Verify Configuration

### Test JWKS Endpoint Access

Check if OpenLiberty can now access the Keycloak JWKS endpoint:

```bash
# Check server logs for SSL errors
tail -f API_server/target/liberty/wlp/usr/servers/authTestServer/logs/messages.log | grep -i "ssl\|pkix\|certificate"
```

**Success indicators:**
- No PKIX errors
- No SSL handshake failures
- JWT tokens validate successfully

### Test API with JWT Token

```bash
# Get token from Keycloak
TOKEN=$(curl -s -k -X POST https://keycloak.lab.home/realms/secure-test/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=authentication-test-api" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "grant_type=password" \
  -d "username=testuser2" \
  -d "password=YOUR_PASSWORD" | jq -r '.access_token')

# Test API
curl -s http://localhost:9080/api/v1/schedule \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Expected result:** 200 OK with schedule data (no SSL errors)

## Troubleshooting

### Still Getting PKIX Errors

**Possible causes:**

1. **Incomplete certificate chain**
   - Verify you imported both root and intermediate CA certificates
   - Check certificate chain with `openssl verify`

2. **Server not restarted**
   - Truststore changes require a full server restart
   - Use `cd API_server && mvn liberty:stop && mvn liberty:dev`

3. **Wrong keystore path**
   - Verify keystore location matches server.xml configuration
   - Check file permissions

### Certificate Import Failed

```bash
# Check if certificate is valid
openssl x509 -in certs/root_ca.crt -text -noout

# Verify certificate format (should be PEM)
head -1 certs/root_ca.crt
# Should show: -----BEGIN CERTIFICATE-----
```

### Hostname Verification Errors

If you see hostname verification errors:

```xml
<!-- Temporarily disable for development -->
<ssl id="jwtSSLConfig"
     ...
     verifyHostname="false"/>
```

For production, ensure certificates have correct Subject Alternative Names (SAN).

## Automated Certificate Import Script

Create a script to automate certificate import:

```bash
#!/bin/bash
# import_ca_certs.sh

KEYSTORE="API_server/target/liberty/wlp/usr/servers/authTestServer/resources/security/key.p12"
STOREPASS="changeit"

# Import root CA
keytool -import \
  -alias homelab-root-ca \
  -file certs/root_ca.crt \
  -keystore "$KEYSTORE" \
  -storepass "$STOREPASS" \
  -noprompt

# Import intermediate CA
keytool -import \
  -alias homelab-intermediate-ca \
  -file certs/intermediate_ca.crt \
  -keystore "$KEYSTORE" \
  -storepass "$STOREPASS" \
  -noprompt

echo "Certificates imported successfully"
keytool -list -keystore "$KEYSTORE" -storepass "$STOREPASS" | grep -i "homelab"
```

Make it executable:

```bash
chmod +x import_ca_certs.sh
./import_ca_certs.sh
```

## Production Considerations

### Use Proper Certificates

For production:

1. **Use certificates from trusted CA** (Let's Encrypt, DigiCert, etc.)
2. **Enable hostname verification**
3. **Remove JVM SSL bypass options**
4. **Use strong keystore passwords**
5. **Regularly rotate certificates**

### Certificate Renewal

When certificates are renewed:

1. Export new certificates
2. Remove old certificates from truststore:
   ```bash
   keytool -delete -alias homelab-root-ca \
     -keystore "$KEYSTORE" -storepass "$STOREPASS"
   ```
3. Import new certificates
4. Restart server

### Monitoring Certificate Expiration

Check certificate expiration dates:

```bash
# Check certificate validity
openssl x509 -in certs/root_ca.crt -noout -dates

# Check keystore certificates
keytool -list -v \
  -keystore target/liberty/wlp/usr/servers/authTestServer/resources/security/key.p12 \
  -storepass changeit | grep -A2 "Valid"
```

## Next Steps

- [Keycloak Setup](../keycloak/realm-setup.md) - Configure Keycloak realm
- [Groups Mapper](../keycloak/groups-mapper.md) - Configure role mapping
- [Troubleshooting](../troubleshooting/common-issues.md) - Common issues

## References

- [OpenLiberty SSL Configuration](https://openliberty.io/docs/latest/reference/config/ssl.html)
- [Java Keytool Documentation](https://docs.oracle.com/en/java/javase/21/docs/specs/man/keytool.html)
- [OpenSSL Documentation](https://www.openssl.org/docs/)