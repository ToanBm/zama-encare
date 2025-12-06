module.exports = {
  apps: [{
    name: 'zama-health-backend',
    script: 'src/index.mjs',
    interpreter: 'node',
    cwd: '/path/to/zama-health/backend', // Đổi path theo VPS của bạn (ví dụ: /home/user/zama-health/backend)
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001, // Backend chạy port 3001 (khác port 3000 của service khác)
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    // Restart nếu crash
    min_uptime: '10s',
    max_restarts: 10,
  }]
};

