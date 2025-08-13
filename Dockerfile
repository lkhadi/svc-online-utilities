# Use lightweight nginx image
FROM nginx:alpine

# Label the container
LABEL maintainer="lkhadi <n.kismara@gmail.com>"
LABEL description="Online Utilities including"

# Create a non-root user for better security
RUN adduser -D -H -u 1000 webuser && \
    chown -R webuser:webuser /usr/share/nginx/html && \
    chown -R webuser:webuser /var/cache/nginx && \
    chown -R webuser:webuser /var/log/nginx && \
    chmod -R 755 /var/log/nginx && \
    chmod -R 755 /var/cache/nginx

# Copy application files to nginx html directory
COPY --chown=webuser:webuser index.html /usr/share/nginx/html/
COPY --chown=webuser:webuser uuidv7-generator.html /usr/share/nginx/html/
COPY --chown=webuser:webuser css/ /usr/share/nginx/html/css/
COPY --chown=webuser:webuser js/ /usr/share/nginx/html/js/

RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    \
    # Compression \
    gzip on; \
    gzip_types text/plain text/css application/javascript application/json; \
    gzip_min_length 1000; \
    \
    # Security headers \
    add_header X-Frame-Options "SAMEORIGIN"; \
    add_header X-XSS-Protection "1; mode=block"; \
    add_header X-Content-Type-Options "nosniff"; \
    \
    # Root directory and index file \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
    try_files $uri $uri/ =404; \
    \
    # Cache static assets \
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg)$ { \
    expires 30d; \
    add_header Cache-Control "public, max-age=2592000"; \
    } \
    \
    # Do not cache HTML \
    location ~* \.(html)$ { \
    expires -1; \
    add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"; \
    } \
    } \
    \
    # Error pages \
    error_page 404 /index.html; \
    }' > /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -q --spider http://localhost/ || exit 1

# Run as non-root
USER webuser

# Expose port 80
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]