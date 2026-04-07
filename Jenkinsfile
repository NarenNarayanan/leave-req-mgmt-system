pipeline {
  agent any

  environment {
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
          sh 'npm run build'
        }
      }
    }

    stage('Deploy with Ansible') {
      steps {
        sh 'ansible-playbook ansible/deploy.yml -i ansible/inventory.ini'
      }
    }

    stage('Verify Deployment') {
      steps {
        sh 'ansible-playbook ansible/verify.yml -i ansible/inventory.ini'
      }
    }

  }

  post {
    success {
      echo "✅ Pipeline SUCCESS"
      echo "✅ Frontend → http://20.207.65.215:3000"
      echo "✅ Backend  → http://20.207.65.215:5000/api/v1/health"
    }
    failure {
      echo "❌ Pipeline FAILED — check stage logs above"
    }
  }
}
