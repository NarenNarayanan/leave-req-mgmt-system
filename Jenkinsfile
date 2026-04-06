pipeline {
  agent any

  environment {
    REACT_APP_API_BASE_URL = 'http://20.207.65.215:5000/api/v1'
  }

  stages {

    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Install Backend') {
      steps { dir('backend') { sh 'npm install' } }
    }

    stage('Install Frontend') {
      steps { dir('frontend') { sh 'npm install' } }
    }

    stage('Build Frontend') {
      steps { dir('frontend') { sh 'npm run build' } }
    }

    stage('Deploy Backend') {
      steps {
        sh '''
          pkill -f "node server.js" || true
          sleep 1
          cd /home/Naren/.jenkins/workspace/leave-mgmt-pipeline/backend

          cat > .env << ENVEOF
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://naren:naren123@cluster0.t2luovz.mongodb.net/leave_mgmt?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=leavemgmt_super_secret_key_2024
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://20.207.65.215:3000
ENVEOF

          nohup node server.js > app.log 2>&1 &
          sleep 3
          cat app.log
        '''
      }
    }

    stage('Deploy Frontend') {
      steps {
        sh '''
          pkill -f "serve -s build" || true
          sleep 1
          cd /home/Naren/.jenkins/workspace/leave-mgmt-pipeline/frontend
          nohup serve -s build -l 3000 > frontend.log 2>&1 &
          sleep 2
          cat frontend.log
        '''
      }
    }
  }

  post {
    success {
      echo "✅ Frontend → http://20.207.65.215:3000"
      echo "✅ Backend  → http://20.207.65.215:5000/api/v1/health"
    }
    failure { echo "❌ Pipeline failed" }
  }
}
