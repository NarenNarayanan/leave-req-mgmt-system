pipeline {
  agent any

  environment {
    DOCKER_IMAGE_BACKEND  = "leave-mgmt-backend"
    DOCKER_IMAGE_FRONTEND = "leave-mgmt-frontend"
    IMAGE_TAG             = "${BUILD_NUMBER}"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
        echo "✅ Code checked out — Build #${BUILD_NUMBER}"
      }
    }

    stage('Install Dependencies') {
      parallel {
        stage('Backend') {
          steps { dir('backend')  { sh 'npm ci' } }
        }
        stage('Frontend') {
          steps { dir('frontend') { sh 'npm ci' } }
        }
      }
    }

    stage('Run Tests') {
      steps {
        dir('backend') { sh 'npm run test:ci' }
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'backend/coverage/**/*.xml'
        }
      }
    }

    stage('Build Frontend') {
      steps {
        dir('frontend') { sh 'npm run build' }
      }
    }

    stage('Docker Build') {
      steps {
        sh 'docker build -t ${DOCKER_IMAGE_BACKEND}:${IMAGE_TAG}  ./backend'
        sh 'docker build -t ${DOCKER_IMAGE_FRONTEND}:${IMAGE_TAG} ./frontend'
        sh 'docker tag ${DOCKER_IMAGE_BACKEND}:${IMAGE_TAG}  ${DOCKER_IMAGE_BACKEND}:latest'
        sh 'docker tag ${DOCKER_IMAGE_FRONTEND}:${IMAGE_TAG} ${DOCKER_IMAGE_FRONTEND}:latest'
      }
    }

    stage('Deploy') {
      steps {
        sh '''
          docker-compose down --remove-orphans || true
          docker-compose up -d --build
          echo "✅ Deployed — Frontend: http://localhost:3000 | Backend: http://localhost:5000"
        '''
      }
    }
  }

  post {
    success { echo "🎉 Pipeline passed — Build #${BUILD_NUMBER}" }
    failure { echo "❌ Pipeline failed — check logs above"       }
    always  { sh 'docker image prune -f || true'                 }
  }
}
