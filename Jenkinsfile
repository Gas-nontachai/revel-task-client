pipeline {
    agent any

    stages {

        stage('Deploy'){
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'githut_dev01', usernameVariable: 'usergit', passwordVariable: 'passgit')]) {
                        sshagent(['ssh_to_36']) {
                            sh """ 
                            ssh -tt -o StrictHostKeyChecking=no root@141.98.19.36 " 
                            cd /home/rvscssupp/domains/ttcenter.rvscs-support.com/public_html/ttcenter-client
                            git checkout release
                            git pull 
                            npm i
                            npm run build
                            pm2 delete ttcenter-client
                            pm2 start 
                            pm2 save
                            pm2 startup
                            "
                            """
                        }
                    }
                }
            }
        }
    }
}