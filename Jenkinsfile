pipeline {
  agent any

  environment {
    // ── Set this once here. Jenkins injects it into every sh step ──
    REACT_APP_API_BASE_URL = 'http://20.207.65.215:5000/api/v1'
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Backend') {
      steps {
        dir('backend') {
          sh 'npm install'
        }
      }
    }

    stage('Install Frontend') {
      steps {
        dir('frontend') {
          sh 'npm install'
        }
      }
    }

    stage('Build Frontend') {
      steps {
        dir('frontend') {
          // REACT_APP_API_BASE_URL is now available — gets baked into the bundle
          sh 'npm run build'
        }
      }
    }

    stage('Deploy Backend') {
      steps {
        sh '''
          # Kill existing backend
          pkill -f "node server.js" || true
          sleep 1

          cd backend

          # Write .env directly on the VM (never commit this to git)
          cat > .env << 'ENVEOF'
PORT=5000
NODE_ENV=production
MONGO_URI=your_mongodb_atlas_uri_here
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://20.207.65.215:3000
ENVEOF

          nohup node server.js > app.log 2>&1 &
          echo "Backend started with PID $!"
          sleep 3

          # Confirm it's running
          curl -s http://localhost:5000/api/v1/health || echo "WARNING: Backend health check failed"
        '''
      }
    }

    stage('Deploy Frontend') {
      steps {
        sh '''
          # Kill existing serve process
          pkill -f "serve -s build" || true
          sleep 1

          # Install serve globally if not present
          npm list -g serve || npm install -g serve

          cd frontend
          nohup serve -s build -l 3000 > frontend.log 2>&1 &
          echo "Frontend started with PID $!"
          sleep 2
          echo "Frontend available at http://20.207.65.215:3000"
        '''
      }
    }
  }

  post {
    success {
      echo "✅ Deployment complete"
      echo "   Frontend: http://20.207.65.215:3000"
      echo "   Backend:  http://20.207.65.215:5000/api/v1/health"
    }
    failure {
      echo "❌ Pipeline failed — check stage logs above"
    }
  }
}
