# Use lightweight nginx image
FROM nginx:alpine

# Label the container
LABEL maintainer="lkhadi <n.kismara@gmail.com>"
LABEL description="Online Utilities including"


# Copy application files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY uuidv7-generator.html /usr/share/nginx/html/
COPY bcrypt-generator.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/

RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    \
    # Root directory and index file \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
    try_files $uri $uri/ =404; \
    } \
    }' > /etc/nginx/conf.d/default.conf

# Update nginx.conf to use pid file in a location that will be writable
RUN sed -i 's|pid        /var/run/nginx.pid;|pid        /tmp/nginx.pid;|' /etc/nginx/nginx.conf && \
    # Remove the user directive since we'll run as non-root
    sed -i 's|user nginx;|# user nginx;|' /etc/nginx/nginx.conf

# Make required directories writable
RUN mkdir -p /var/cache/nginx /var/log/nginx /tmp/nginx && \
    chmod -R 777 /var/cache/nginx /var/log/nginx /tmp/nginx /etc/nginx/conf.d


# Health check


# Expose port 80
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]