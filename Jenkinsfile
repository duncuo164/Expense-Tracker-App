@Library('pipeline-shared-lib') _

pipeline {
    agent any

    environment {
        IMAGE_NAME="expense-tracker-application-image"
    }

    stages {
        stage('Clone code') {
            steps {
                checkout scm
            }
        }

        stage('Sonarqube code analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {          
                sh """
                    sonar-scanner \
                    -Dsonar.projectKey=expense-tracker-application \
                    -Dsonar.projectName="expense-tracker-application" \
                    -Dsonar.sources=. \
                    -Dsonar.exclusions=**/node_modules/**,**/vendor/** \
                    -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                """
                }
            }
        }

        stage('Quality Gate') {
            steps {
                script {
                    timeout(time: 5, unit: 'MINUTES') {

                        def qg = waitForQualityGate()

                        if (qg.status != 'OK') {

                            sendTelegramQualityFail(qg.status)

                            error("""
                                    PIPELINE FAILED
                                    ━━━━━━━━━━━━━━━━━━━
                                    Reason:
                                    SonarQube Quality Gate failed

                                    Status: ${qg.status}

                                    Pipeline stopped intentionally to prevent:
                                    - Unsafe deployment
                                    - Vulnerable code release
                                    - Low quality code promotion

                                    Check SonarQube report before retrying.
                                    ━━━━━━━━━━━━━━━━━━━
                                    """
                                )
                        }

                        sendTelegramQualityPass()
                        echo "Quality Gate passed — pipeline continues"
                    }
                }
            }
        }

        stage('Build Image') {
            steps {
                script {
                    env.IMAGE_TAG = dockerBuild(
                        imageName: "expense-tracker-application-image",
                        gitCommit: env.GIT_COMMIT
                    )
                }
            }
        }

        stage('Push image to docker hub') {
            steps {
                script {
                    dockerPush(
                        imageName: "${env.IMAGE_NAME}",
                        tag: env.IMAGE_TAG,
                        credentialId: "JENKIN_PIPELINE_DOCKER_HUB"
                    )
                }
            }
        }


    }
}

// helper telegram method
def sendTelegramQualityFail(String status) {
    withCredentials([
        string(credentialsId: 'TELEGRAM_BOT_TOKEN', variable: 'TELEGRAM_BOT_TOKEN'),
        string(credentialsId: 'TELEGRAM_CHAT_ID',   variable: 'TELEGRAM_CHAT_ID')
    ]) {
        def message = "❌ <b>Quality Gate FAILED</b>\n" +
                      "━━━━━━━━━━━━━━━━━━━\n" +
                      "<b>Project:</b>  expense-tracker-application\n" +
                      "<b>Status:</b>   ${status}\n" +
                      "<b>Branch:</b>   ${env.GIT_BRANCH ?: 'unknown'}\n" +
                      "<b>Build:</b>    #${env.BUILD_NUMBER}\n" +
                      "━━━━━━━━━━━━━━━━━━━\n" +
                      "<b>Issues may include:</b>\n" +
                      "• New bugs introduced\n" +
                      "• Security vulnerabilities\n" +
                      "• Test coverage below 80%\n" +
                      "• Code duplication above 3%\n" +
                      "━━━━━━━━━━━━━━━━━━━\n" +
                      "🔍 <b>Review:</b> ${env.BUILD_URL}console\n" +
                      "📊 <b>SonarQube:</b> ${env.SONAR_HOST_URL ?: 'http://your-sonar-domain.com'}"

        sh """
          curl -s -X POST \
            "https://api.telegram.org/bot\${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d chat_id="\${TELEGRAM_CHAT_ID}" \
            -d parse_mode="HTML" \
            --data-urlencode text="${message}"
        """
    }
}

def sendTelegramQualityPass() {
    withCredentials([
        string(credentialsId: 'TELEGRAM_BOT_TOKEN', variable: 'TELEGRAM_BOT_TOKEN'),
        string(credentialsId: 'TELEGRAM_CHAT_ID',   variable: 'TELEGRAM_CHAT_ID')
    ]) {
        def message = "✅ <b>Quality Gate PASSED</b>\n" +
                      "━━━━━━━━━━━━━━━━━━━\n" +
                      "<b>Project:</b>  expense-tracker-application\n" +
                      "<b>Branch:</b>   ${env.GIT_BRANCH ?: 'unknown'}\n" +
                      "<b>Build:</b>    #${env.BUILD_NUMBER}\n" +
                      "━━━━━━━━━━━━━━━━━━━\n" +
                      "All quality checks passed — code is clean ✓\n" +
                      "━━━━━━━━━━━━━━━━━━━\n" +
                      "🔍 <b>Logs:</b> ${env.BUILD_URL}console"

        sh """
          curl -s -X POST \
            "https://api.telegram.org/bot\${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d chat_id="\${TELEGRAM_CHAT_ID}" \
            -d parse_mode="HTML" \
            --data-urlencode text="${message}"
        """
    }
}