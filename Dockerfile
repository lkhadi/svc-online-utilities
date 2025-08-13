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
COPY --chown=webuser:webuser uuid-generator.html /usr/share/nginx/html/
COPY --chown=webuser:webuser css/ /usr/share/nginx/html/css/
COPY --chown=webuser:webuser js/ /usr/share/nginx/html/js/

# Configure nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -q --spider http://localhost/ || exit 1

# Run as non-root
USER webuser

# Expose port 80
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]