aws cloudformation deploy^
    --template-file ./CloudFormation/hosting.yml^
    --stack-name bliskavka-com-stack^
    --tags^
        Client=Bliskavka^
        Project=Home^
        Environment=Production^
    --profile lsw^
    --region us-east-1