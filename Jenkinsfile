pipeline {
  agent any

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
          sh 'npm run build || true'
        }
      }
    }

    stage('Run Backend') {
      steps {
        sh '''
          pkill node || true
          cd backend
          nohup node server.js > app.log 2>&1 &
        '''
      }
    }

  }
}
