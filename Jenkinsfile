
pipeline {

    agent any

    stages {

        stage('Check Files') {
            steps {
                echo 'Checking project files...'
                bat 'dir'
            }
        }

        stage('HTML Validation') {
            steps {
                echo 'Validating HTML files...'
                sleep(time: 5, unit: 'SECONDS')
            }
        }

        stage('CSS Validation') {
            steps {
                echo 'Checking CSS files...'
                sleep(time: 5, unit: 'SECONDS')
            }
        }

        stage('JavaScript Validation') {
            steps {
                echo 'Checking JavaScript files...'
                sleep(time: 5, unit: 'SECONDS')
            }
        }

        stage('Build') {
            steps {
                echo 'Building Website...'
                sleep(time: 8, unit: 'SECONDS')
            }
        }

        stage('Testing') {
            steps {
                echo 'Running Tests...'
                sleep(time: 8, unit: 'SECONDS')
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying Website...'
                sleep(time: 5, unit: 'SECONDS')
            }
        }
    }

    post {

        success {
            echo 'Pipeline Executed Successfully!'
        }

        failure {
            echo 'Pipeline Failed!'
        }

        always {
            echo 'Pipeline Finished!'
        }
    }
}
